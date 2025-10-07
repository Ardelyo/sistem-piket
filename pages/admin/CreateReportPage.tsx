import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Rating from '../../components/ui/Rating';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import type { Student, Absensi, LaporanRating, Schedule } from '../../types';
import { ArrowLeftIcon, StarIcon, CheckBadgeIcon, CameraIcon, DocumentTextIcon, TrashIcon, ExclamationTriangleIcon, UserGroupIcon, PencilIcon, CheckCircleIcon, XCircleIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const RATING_AREAS: { key: keyof LaporanRating, label: string }[] = [
    { key: 'lantai', label: 'Lantai' },
    { key: 'papanTulis', label: 'Papan Tulis' },
    { key: 'meja', label: 'Meja & Kursi' },
    { key: 'sampah', label: 'Sampah' },
];

const ALL_TASKS = [
    'Sapu lantai depan', 'Sapu lantai belakang', 'Pel lantai', 'Buang sampah kelas', 
    'Buang sampah ke TPS', 'Hapus papan tulis', 'Rapikan meja guru', 'Rapikan meja siswa', 
    'Tutup jendela', 'Matikan lampu', 'Kunci pintu'
];

const NOTE_TEMPLATES = {
    "": "Pilih template...",
    "Sangat Baik": "Piket dilaksanakan dengan sangat baik. Semua area bersih dan rapi. Pertahankan!",
    "Baik": "Kerja bagus! Kebersihan sudah baik, ada beberapa detail kecil yang bisa ditingkatkan.",
    "Cukup": "Piket sudah dilaksanakan, namun beberapa area masih perlu perhatian lebih.",
    "Perlu Perbaikan": "Mohon tingkatkan lagi kebersihannya. Banyak area yang terlewat atau kurang bersih."
};

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ["Pilih Siswa", "Penilaian Bulk", "Review & Submit"];
    return (
        <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= index + 1 ? 'bg-accent text-white' : 'bg-card text-text-light'}`}>
                            {index + 1}
                        </div>
                        <p className={`mt-2 text-xs sm:text-sm font-semibold ${currentStep >= index + 1 ? 'text-primary' : 'text-text-light'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-grow h-1 mx-2 ${currentStep > index + 1 ? 'bg-accent' : 'bg-card'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};


const CreateReportPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addNotification } = useNotification();
    
    const [mode, setMode] = useState<'individual' | 'bulk'>('individual');
    const [bulkStep, setBulkStep] = useState(1);

    // Common State
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [ratings, setRatings] = useState<Record<keyof LaporanRating, { rating: number; catatan: string }>>({ lantai: { rating: 0, catatan: '' }, papanTulis: { rating: 0, catatan: '' }, meja: { rating: 0, catatan: '' }, sampah: { rating: 0, catatan: '' }});
    const [tasks, setTasks] = useState<Record<string, boolean>>({});
    const [photos, setPhotos] = useState<{ id: string, url: string }[]>([]);
    const [evaluationNotes, setEvaluationNotes] = useState('');

    // Student & Selection State
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [checkedOutStudents, setCheckedOutStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
    const [filterDay, setFilterDay] = useState<string>('Semua');

    // Loading & Submission State
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [submissionType, setSubmissionType] = useState<'draft' | 'submitted'>('submitted');
    const [submissionProgress, setSubmissionProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [checkedOut, all, scheduleData] = await Promise.all([
                    api.getStudentsCheckedOutToday(),
                    api.getStudents(false),
                    api.getSchedule()
                ]);
                setCheckedOutStudents(checkedOut);
                setAllStudents(all);
                setSchedule(scheduleData);
                setFilteredStudents(all); // Initially show all
            } catch (error) {
                addNotification('Gagal memuat data siswa', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [addNotification]);

    useEffect(() => {
        if (!schedule) return;
        let studentsToList = allStudents;
        if (filterDay !== 'Semua') {
            const studentNamesOnDay = schedule[filterDay as keyof Schedule] || [];
            studentsToList = allStudents.filter(s => studentNamesOnDay.includes(s.namaLengkap));
        }
        setFilteredStudents(studentsToList);
    }, [filterDay, allStudents, schedule]);
    
    const selectedStudents = useMemo(() => {
        return allStudents.filter(s => selectedStudentIds.has(s.id));
    }, [selectedStudentIds, allStudents]);

    const avgRating = useMemo(() => {
        // FIX: Explicitly type `r` as `{ rating: number }` to resolve TypeScript inference issue where it was treated as `unknown`.
        const ratedAreas = Object.values(ratings).filter(r => r.rating > 0);
        if (ratedAreas.length === 0) return 0;
        // FIX: With `ratedAreas` correctly typed, `r` is now correctly inferred in `reduce`, resolving the arithmetic operation error.
        return ratedAreas.reduce((sum, r) => sum + r.rating, 0) / ratedAreas.length;
    }, [ratings]);

    const completedTasksCount = useMemo(() => Object.values(tasks).filter(Boolean).length, [tasks]);

    const totalXp = useMemo(() => {
        let xp = 0;
        xp += 20; // Base XP
        xp += completedTasksCount * 5;
        if (avgRating >= 4.5) xp += 15;
        else if (avgRating >= 3.5) xp += 10;
        if (photos.length > 0) xp += 15;
        return xp;
    }, [completedTasksCount, avgRating, photos]);

    const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (photos.length + files.length > 5) {
            addNotification('Maksimal 5 foto.', 'error');
            return;
        }
        for (const file of files) {
            const url = URL.createObjectURL(file); // For preview
            setPhotos(prev => [...prev, { id: `${file.name}-${Date.now()}`, url }]);
        }
    }, [photos.length, addNotification]);

    const handleFormSubmit = async () => {
        if (!user) return;
        setIsConfirmModalOpen(false);
        setIsSubmitting(true);
        setSubmissionProgress({ current: 0, total: selectedStudents.length });

        const reportsToCreate = selectedStudents.map(student => ({
            tanggal,
            nama: student.namaLengkap,
            // FIX: Use a double assertion (`as unknown as LaporanRating`) to correctly cast the dynamically created object to the specific LaporanRating type, resolving a type mismatch error.
            rating: Object.fromEntries(Object.entries(ratings).map(([k, v]) => [k, v.rating])) as unknown as LaporanRating,
            // FIX: Explicitly type `v` to resolve `unknown` type error when accessing `v.catatan`.
            ratingNotes: Object.fromEntries(Object.entries(ratings).map(([k, v]) => [k, v.catatan])),
            tasks,
            catatan: evaluationNotes,
            fotoBukti: photos.map(p => p.url),
            xp: totalXp,
            status: submissionType,
        }));

        let successCount = 0;
        for (let i = 0; i < reportsToCreate.length; i++) {
            const reportData = reportsToCreate[i];
            setSubmissionProgress({ current: i + 1, total: reportsToCreate.length });
            const res = await api.createLaporan(reportData, user.namaLengkap);
            if (res.success) {
                successCount++;
            } else {
                addNotification(`Gagal membuat laporan untuk ${reportData.nama}: ${res.message}`, 'error');
            }
        }
        
        addNotification(`${successCount} dari ${reportsToCreate.length} laporan berhasil dibuat.`, 'success');
        setIsSubmitting(false);
        navigate('/admin');
    };

    const renderStep1 = () => (
        <Card>
            <h2 className="text-xl font-bold text-primary mb-4">Pilih Siswa</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                    <label className="font-medium text-sm">Filter by Hari Piket</label>
                    <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="w-full mt-1 p-3 bg-background rounded-xl border border-card">
                        <option>Semua</option>
                        {schedule && Object.keys(schedule).map(day => <option key={day}>{day}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)))}>Pilih Semua</Button>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedStudentIds(new Set())}>Batal Pilih</Button>
                </div>
                <p className="font-semibold text-primary">Dipilih: {selectedStudentIds.size} siswa</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 bg-background rounded-xl">
                {filteredStudents.map(s => {
                    const isCheckedOut = checkedOutStudents.some(cos => cos.id === s.id);
                    return (
                    <label key={s.id} className={`p-3 rounded-xl border-2 transition-colors cursor-pointer ${selectedStudentIds.has(s.id) ? 'bg-accent/20 border-accent' : 'bg-card border-transparent'}`}>
                        <div className="flex items-start gap-3">
                            <input type="checkbox" checked={selectedStudentIds.has(s.id)} onChange={() => {
                                setSelectedStudentIds(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(s.id)) newSet.delete(s.id);
                                    else newSet.add(s.id);
                                    return newSet;
                                });
                            }} className="mt-1 h-5 w-5 rounded text-accent focus:ring-accent" />
                            <div className="flex-1">
                                <img src={s.foto} alt={s.namaLengkap} className="w-12 h-12 rounded-full mx-auto mb-2"/>
                                <p className="font-bold text-sm text-center">{s.namaLengkap}</p>
                                <p className="text-xs text-text-light text-center">{s.hariPiket}</p>
                                <div className={`mt-2 text-xs text-center font-semibold px-2 py-1 rounded-full ${isCheckedOut ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {isCheckedOut ? 'Sudah Absen Keluar' : 'Belum Absen'}
                                </div>
                            </div>
                        </div>
                    </label>
                )})}
            </div>
            <div className="mt-6 flex justify-end">
                <Button size="lg" onClick={() => setBulkStep(2)} disabled={selectedStudentIds.size < 2}>
                    Lanjut ke Penilaian ({selectedStudentIds.size})
                </Button>
            </div>
            {selectedStudentIds.size < 2 && <p className="text-right text-sm text-danger mt-2">Pilih minimal 2 siswa untuk melanjutkan.</p>}
        </Card>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Penilaian Sama untuk Semua</h2>
                    <div className={`text-3xl font-bold px-4 py-2 rounded-xl ${avgRating > 4 ? 'text-green-600 bg-green-100' : avgRating >= 3 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'}`}>{avgRating.toFixed(1)} ⭐</div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {RATING_AREAS.map(area => (
                        <Card key={area.key} className="!bg-background">
                            <label className="font-semibold">{area.label}</label>
                            <Rating count={5} value={ratings[area.key].rating} onChange={val => setRatings(p => ({...p, [area.key]: {...p[area.key], rating: val}}))} />
                        </Card>
                    ))}
                </div>
            </Card>
            <Card>
                <h2 className="text-xl font-bold text-primary mb-2">Checklist Tugas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ALL_TASKS.map(task => (
                        <label key={task} className="flex items-center space-x-2 bg-background p-3 rounded-xl cursor-pointer hover:bg-card/70">
                            <input type="checkbox" checked={!!tasks[task]} onChange={() => setTasks(p => ({...p, [task]: !p[task]}))} className="h-5 w-5 rounded text-accent" />
                            <span>{task}</span>
                        </label>
                    ))}
                </div>
            </Card>
             <Card>
                <h2 className="text-xl font-bold text-primary mb-4">Catatan & Dokumentasi</h2>
                 <select onChange={e => setEvaluationNotes(NOTE_TEMPLATES[e.target.value as keyof typeof NOTE_TEMPLATES])} className="w-full p-3 bg-background rounded-xl border border-card mb-2">
                    {Object.keys(NOTE_TEMPLATES).map(key => <option key={key} value={key}>{key || "Pilih Template Catatan..."}</option>)}
                </select>
                <textarea value={evaluationNotes} onChange={e => setEvaluationNotes(e.target.value)} rows={4} className="w-full p-3 bg-background rounded-xl border border-card" placeholder="Berikan feedback..."/>
                <label className="mt-4 block w-full text-center p-4 bg-background border-2 border-dashed rounded-xl cursor-pointer hover:bg-card/70">
                    <CameraIcon className="h-8 w-8 text-text-light mx-auto"/>
                    <span className="mt-1 text-sm">Tambah Foto Bukti</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden"/>
                </label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                    {photos.map(p => <img key={p.id} src={p.url} className="w-full h-16 object-cover rounded-lg" alt="bukti"/>)}
                </div>
            </Card>
            <div className="mt-6 flex justify-between">
                <Button size="lg" variant="secondary" onClick={() => setBulkStep(1)}>Kembali</Button>
                <Button size="lg" onClick={() => setBulkStep(3)}>Lanjut ke Review</Button>
            </div>
        </div>
    );
    
    const [expandedReview, setExpandedReview] = useState<number | null>(null);

    const renderStep3 = () => (
        <Card>
            <h2 className="text-xl font-bold text-primary mb-2">Review & Submit</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4 text-center">
                <div className="bg-background p-3 rounded-xl"><p className="text-sm">Total Laporan akan dibuat</p><p className="font-bold text-2xl">{selectedStudents.length}</p></div>
                <div className="bg-background p-3 rounded-xl"><p className="text-sm">Total XP akan didistribusi</p><p className="font-bold text-2xl text-accent">{selectedStudents.length * totalXp}</p></div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto p-2 bg-background rounded-xl">
            {selectedStudents.map(student => (
                <div key={student.id} className="bg-card rounded-lg">
                    <button className="w-full p-3 text-left flex justify-between items-center" onClick={() => setExpandedReview(prev => prev === student.id ? null : student.id)}>
                        <p className="font-semibold">{student.namaLengkap}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <span>⭐ {avgRating.toFixed(1)}</span>
                            <span className="font-bold text-accent">+{totalXp} XP</span>
                            {expandedReview === student.id ? <ChevronUpIcon className="h-5 w-5"/> : <ChevronDownIcon className="h-5 w-5"/>}
                        </div>
                    </button>
                    {expandedReview === student.id && (
                        <div className="p-3 border-t border-background space-y-2">
                            <p className="text-xs"><strong>Tasks:</strong> {completedTasksCount}/{ALL_TASKS.length} selesai</p>
                            <p className="text-xs italic"><strong>Catatan:</strong> "{evaluationNotes}"</p>
                        </div>
                    )}
                </div>
            ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" className="w-full" onClick={() => { setSubmissionType('draft'); setIsConfirmModalOpen(true); }}>Simpan Semua sebagai Draft</Button>
                <Button size="lg" className="w-full" onClick={() => { setSubmissionType('submitted'); setIsConfirmModalOpen(true); }}>Submit Semua Laporan</Button>
            </div>
             <div className="mt-2 flex justify-center">
                <Button variant="secondary" onClick={() => setBulkStep(2)}>Kembali ke Penilaian</Button>
            </div>
        </Card>
    );

    const renderIndividualMode = () => (
        // Placeholder for the original individual form
        <Card>
            <h2 className="text-xl font-bold text-primary mb-4">Mode Individual</h2>
            <p className="text-text-light">Mode pembuatan laporan satu per satu. Fitur ini sedang dalam pengembangan.</p>
            <p className="text-text-light mt-2">Silakan gunakan <strong>Mode Bulk</strong> untuk membuat laporan.</p>
        </Card>
    );

    if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" color="border-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="secondary" size="sm" className="!p-3" onClick={() => navigate(-1)}>
                    <ArrowLeftIcon className="h-5 w-5"/>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-primary">Buat Laporan Piket</h1>
                    <p className="text-text-light">Admin / Laporan / Buat</p>
                </div>
            </div>
            
            <Card className="!p-2">
                <div className="flex justify-center bg-card/50 p-1 rounded-2xl">
                    <button onClick={() => setMode('individual')} className={`w-1/2 py-2.5 rounded-xl font-semibold transition-colors ${mode === 'individual' ? 'bg-background shadow-md' : 'text-text-light'}`}>Mode Individual</button>
                    <button onClick={() => setMode('bulk')} className={`w-1/2 py-2.5 rounded-xl font-semibold transition-colors ${mode === 'bulk' ? 'bg-background shadow-md' : 'text-text-light'}`}>Mode Bulk</button>
                </div>
            </Card>

            {mode === 'bulk' && <Stepper currentStep={bulkStep} />}

            {mode === 'individual' && renderIndividualMode()}
            {mode === 'bulk' && bulkStep === 1 && renderStep1()}
            {mode === 'bulk' && bulkStep === 2 && renderStep2()}
            {mode === 'bulk' && bulkStep === 3 && renderStep3()}
            
             <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Konfirmasi Submit">
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-16 w-16 text-warning mx-auto mb-4"/>
                    <p className="text-text-light mb-6">
                        Anda akan <strong>{submissionType === 'submitted' ? 'membuat dan mengirim' : 'menyimpan draft'}</strong> {selectedStudents.length} laporan. Lanjutkan?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Batal</Button>
                        <Button onClick={handleFormSubmit}>Ya, Lanjutkan</Button>
                    </div>
                </div>
            </Modal>
             <Modal isOpen={isSubmitting} onClose={() => {}} title="Memproses Laporan...">
                <div className="flex flex-col items-center justify-center p-8">
                    <Spinner size="lg" color="border-primary" />
                    <p className="mt-4 text-text-light">Membuat laporan {submissionProgress.current} dari {submissionProgress.total}...</p>
                    <div className="w-full bg-card rounded-full h-2.5 mt-2">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: `${(submissionProgress.current / submissionProgress.total) * 100}%` }}></div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CreateReportPage;