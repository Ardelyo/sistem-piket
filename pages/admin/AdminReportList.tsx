import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import type { Laporan, Student, LaporanRating } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
    PlusCircleIcon, DocumentMagnifyingGlassIcon, TrashIcon, PencilIcon, ChevronDownIcon, 
    ChevronUpIcon, StarIcon, CalendarDaysIcon, TrophyIcon, ArrowDownTrayIcon, CheckIcon, 
    XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PhotoIcon 
} from '@heroicons/react/24/solid';

declare const XLSX: any;

const ALL_TASKS = [
    'Sapu lantai depan', 'Sapu lantai belakang', 'Pel lantai', 'Buang sampah kelas', 
    'Buang sampah ke TPS', 'Hapus papan tulis', 'Rapikan meja guru', 'Rapikan meja siswa', 
    'Tutup jendela', 'Matikan lampu', 'Kunci pintu'
];

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; }> = ({ title, value, icon: Icon }) => (
    <Card className="p-4">
        <div className="flex items-center space-x-3">
            <div className="bg-accent/10 p-3 rounded-full">
                <Icon className="h-6 w-6 text-accent" />
            </div>
            <div>
                <p className="text-sm text-text-light">{title}</p>
                <p className="text-xl font-bold text-primary">{value}</p>
            </div>
        </div>
    </Card>
);

const ExpandedRowContent: React.FC<{ report: Laporan }> = ({ report }) => {
    const ratingData = Object.entries(report.rating).map(([name, value]) => ({ name: name.replace('papanTulis', 'Papan Tulis'), rating: value }));
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

    return (
        <div className="p-4 bg-background rounded-b-2xl space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-primary mb-2">Dokumentasi Foto</h4>
                    {report.fotoBukti.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                        {report.fotoBukti.map((foto, index) => (
                             <img key={index} src={foto} alt={`bukti ${index+1}`} className="rounded-lg object-cover w-full h-32" />
                        ))}
                        </div>
                    ) : <p className="text-sm text-text-light">Tidak ada foto.</p>}
                </div>
                 <div>
                    <h4 className="font-semibold text-primary mb-2">Breakdown Rating</h4>
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <XAxis type="number" domain={[0, 5]} hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="rating" barSize={20} radius={[0, 10, 10, 0]}>
                                {ratingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-primary mb-2">Checklist Tugas</h4>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {ALL_TASKS.map(task => (
                        <li key={task} className="flex items-center">
                            {report.tasks[task] ? <CheckIcon className="h-4 w-4 text-success mr-2" /> : <XMarkIcon className="h-4 w-4 text-danger mr-2" />}
                            {task}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                 <h4 className="font-semibold text-primary mb-2">Catatan Evaluasi</h4>
                 <p className="text-sm text-text-light italic bg-card/50 p-3 rounded-lg">"{report.catatan || 'Tidak ada catatan.'}"</p>
            </div>
             <div className="text-xs text-text-light pt-2 border-t border-card">
                Dibuat oleh <strong>{report.verifiedBy}</strong>
            </div>
        </div>
    );
};


const AdminReportList: React.FC = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    
    const [allLaporan, setAllLaporan] = useState<Laporan[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    
    const [filters, setFilters] = useState({ student: '', startDate: '', endDate: '', rating: '', status: '' });
    const [sortBy, setSortBy] = useState({ key: 'tanggal', order: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState<{ action: 'delete' | 'set_draft' | 'set_submitted'; title: string } | null>(null);

    const ROWS_PER_PAGE = 20;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [laporanData, studentsData] = await Promise.all([api.getAllLaporan(), api.getStudents(false)]);
                setAllLaporan(laporanData);
                setStudents(studentsData);
            } catch (e) {
                addNotification("Gagal memuat data laporan", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [addNotification]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const resetFilters = () => setFilters({ student: '', startDate: '', endDate: '', rating: '', status: '' });
    
    const filteredAndSortedLaporan = useMemo(() => {
        let filtered = [...allLaporan];

        if (filters.student) filtered = filtered.filter(l => l.nama === filters.student);
        if (filters.status) filtered = filtered.filter(l => l.status === filters.status);
        if (filters.startDate) filtered = filtered.filter(l => new Date(l.tanggal) >= new Date(filters.startDate));
        if (filters.endDate) filtered = filtered.filter(l => new Date(l.tanggal) <= new Date(filters.endDate));
        if (filters.rating) {
            const [min, max] = filters.rating.split('-').map(Number);
            filtered = filtered.filter(l => l.avgRating >= min && l.avgRating < (max || 6));
        }

        return filtered.sort((a, b) => {
            const valA = a[sortBy.key as keyof Laporan];
            const valB = b[sortBy.key as keyof Laporan];
            if (valA < valB) return sortBy.order === 'asc' ? -1 : 1;
            if (valA > valB) return sortBy.order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [allLaporan, filters, sortBy]);

    const paginatedLaporan = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedLaporan.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [filteredAndSortedLaporan, currentPage]);
    
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonthLaporan = allLaporan.filter(l => new Date(l.tanggal).getMonth() === now.getMonth() && new Date(l.tanggal).getFullYear() === now.getFullYear());
        const totalRating = allLaporan.reduce((sum, l) => sum + l.avgRating, 0);
        
        const studentRatings: {[key: string]: { total: number, count: number, foto: string }} = {};
        allLaporan.forEach(l => {
            if (!studentRatings[l.nama]) {
                const student = students.find(s => s.namaLengkap === l.nama);
                studentRatings[l.nama] = { total: 0, count: 0, foto: student?.foto || '' };
            }
            studentRatings[l.nama].total += l.avgRating;
            studentRatings[l.nama].count++;
        });

        let topPerformer = { name: '-', avg: 0 };
        Object.entries(studentRatings).forEach(([name, data]) => {
            const avg = data.total / data.count;
            if (avg > topPerformer.avg) {
                topPerformer = { name, avg };
            }
        });
        
        return {
            totalThisMonth: thisMonthLaporan.length,
            avgRating: allLaporan.length > 0 ? (totalRating / allLaporan.length).toFixed(1) : '0.0',
            topPerformer: `${topPerformer.name} (${topPerformer.avg.toFixed(1)} ⭐)`
        };
    }, [allLaporan, students]);
    
    const handleSort = (key: keyof Laporan) => {
        setSortBy(prev => ({ key, order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc' }));
    };
    
    const handleSelectRow = (id: number) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(new Set(paginatedLaporan.map(l => l.id)));
        } else {
            setSelectedRows(new Set());
        }
    };
    
    const confirmBulkAction = (action: 'delete' | 'set_draft' | 'set_submitted') => {
        const actionsMap = {
            delete: { title: 'Hapus Laporan Terpilih' },
            set_draft: { title: 'Ubah Status ke Draft' },
            set_submitted: { title: 'Ubah Status ke Terkirim' }
        };
        setBulkAction({ action, ...actionsMap[action] });
        setIsConfirmModalOpen(true);
    };

    const handleBulkAction = async () => {
        if (!bulkAction) return;
        
        // FIX: Explicitly type `ids` as `number[]` to resolve type inference issue.
        const ids: number[] = Array.from(selectedRows);
        let res;
        if (bulkAction.action === 'delete') {
            res = await api.deleteMultipleLaporan(ids);
        } else {
            const status = bulkAction.action === 'set_draft' ? 'draft' : 'submitted';
            res = await api.updateMultipleLaporanStatus(ids, status);
        }
        
        if (res.success) {
            addNotification(res.message, 'success');
            const [laporanData] = await Promise.all([api.getAllLaporan()]);
            setAllLaporan(laporanData);
            setSelectedRows(new Set());
        } else {
            addNotification(res.message, 'error');
        }
        setIsConfirmModalOpen(false);
        setBulkAction(null);
    };

    const exportToExcel = () => {
        const dataToExport = filteredAndSortedLaporan.map(l => ({
            Tanggal: l.tanggal,
            Nama: l.nama,
            Rating_Total: l.avgRating,
            Rating_Lantai: l.rating.lantai,
            Rating_Papan_Tulis: l.rating.papanTulis,
            Rating_Meja: l.rating.meja,
            Rating_Sampah: l.rating.sampah,
            Tugas_Selesai: Object.values(l.tasks).filter(Boolean).length,
            XP: l.xp,
            Status: l.status,
            Catatan: l.catatan,
            Diverifikasi_Oleh: l.verifiedBy,
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Piket");
        XLSX.writeFile(wb, "laporan_piket_X-E8.xlsx");
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-24"/><Skeleton className="h-64"/></div>

    if (allLaporan.length === 0) {
        return (
             <Card className="text-center py-16">
                <DocumentMagnifyingGlassIcon className="h-24 w-24 mx-auto text-text-light/50" />
                <h2 className="text-2xl font-bold text-primary mt-4">Belum Ada Laporan</h2>
                <p className="text-text-light mt-2 mb-6">Mulai buat laporan penilaian untuk siswa yang telah selesai piket.</p>
                <Button size="lg" onClick={() => navigate('/admin/laporan/create')}>
                    <PlusCircleIcon className="h-6 w-6 mr-2" />
                    Buat Laporan Pertama
                </Button>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
             <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Manajemen Laporan Piket</h2>
                    <p className="text-text-light">Total {filteredAndSortedLaporan.length} laporan ditemukan.</p>
                </div>
                <Button onClick={() => navigate('/admin/laporan/create')} className="bg-success hover:bg-green-600">
                    <PlusCircleIcon className="h-5 w-5 mr-2" /> Buat Laporan Baru
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Laporan Bulan Ini" value={stats.totalThisMonth} icon={CalendarDaysIcon} />
                <StatCard title="Rating Rata-rata" value={stats.avgRating} icon={StarIcon} />
                <StatCard title="Top Performer" value={stats.topPerformer} icon={TrophyIcon} />
            </div>

            <Card>
                <h3 className="font-semibold text-primary mb-3">Filter Laporan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <select name="student" value={filters.student} onChange={handleFilterChange} className="w-full p-2 bg-background rounded-lg border border-card">
                        <option value="">Semua Siswa</option>
                        {students.map(s => <option key={s.id} value={s.namaLengkap}>{s.namaLengkap}</option>)}
                    </select>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 bg-background rounded-lg border border-card" />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 bg-background rounded-lg border border-card" />
                    <select name="rating" value={filters.rating} onChange={handleFilterChange} className="w-full p-2 bg-background rounded-lg border border-card">
                        <option value="">Semua Rating</option>
                        <option value="1-3">Buruk (1-2.9)</option>
                        <option value="3-5">Cukup (3-4.9)</option>
                        <option value="5-6">Baik (5)</option>
                    </select>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 bg-background rounded-lg border border-card">
                        <option value="">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Terkirim</option>
                    </select>
                </div>
                <div className="flex gap-3 mt-3">
                     <Button onClick={resetFilters} variant="secondary" size="sm">Reset Filter</Button>
                </div>
            </Card>

            <Card className="!p-0 overflow-hidden">
                 <div className="p-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold">{selectedRows.size} terpilih</p>
                        {selectedRows.size > 0 && (
                            <>
                                <Button size="sm" variant="secondary" onClick={() => confirmBulkAction('set_submitted')}>Set Terkirim</Button>
                                <Button size="sm" variant="secondary" onClick={() => confirmBulkAction('set_draft')}>Set Draft</Button>
                                <Button size="sm" variant="secondary" className="!text-red-600 !bg-red-100" onClick={() => confirmBulkAction('delete')}>Hapus</Button>
                            </>
                        )}
                    </div>
                    <Button onClick={exportToExcel} variant="secondary" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Export Excel
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-background">
                            <tr>
                                <th className="p-3 w-4"><input type="checkbox" onChange={handleSelectAll} className="rounded" /></th>
                                {['Tanggal', 'Nama Siswa', 'Rating', 'Tugas', 'XP', 'Status', 'Aksi'].map(h => 
                                <th key={h} className="p-3 text-left font-semibold" onClick={() => handleSort(h.toLowerCase().replace(' ', '') as keyof Laporan)}>
                                    <div className="flex items-center gap-1 cursor-pointer">{h} {sortBy.key === h.toLowerCase().replace(' ', '') && (sortBy.order === 'asc' ? <ChevronUpIcon className="h-4 w-4"/> : <ChevronDownIcon className="h-4 w-4"/>)}</div>
                                </th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLaporan.map(l => (
                                <Fragment key={l.id}>
                                <tr className="border-b border-card hover:bg-card/50 transition-colors" onClick={() => setExpandedRowId(p => p === l.id ? null : l.id)}>
                                    <td className="p-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedRows.has(l.id)} onChange={() => handleSelectRow(l.id)} className="rounded" /></td>
                                    <td className="p-3 whitespace-nowrap">{l.tanggal}</td>
                                    <td className="p-3 font-semibold text-primary truncate max-w-xs">{l.nama}</td>
                                    <td className="p-3 font-semibold text-yellow-600">⭐ {l.avgRating.toFixed(1)}</td>
                                    <td className="p-3">
                                        <div className="w-20 bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-success h-2.5 rounded-full" style={{width: `${(Object.values(l.tasks).filter(Boolean).length / ALL_TASKS.length) * 100}%`}}></div>
                                        </div>
                                    </td>
                                    <td className="p-3"><span className="font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">+{l.xp} XP</span></td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${l.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {l.status === 'submitted' ? 'Terkirim' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-3" onClick={e => e.stopPropagation()}>
                                        <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" className="!p-2"><PencilIcon className="h-4 w-4"/></Button>
                                        <Button size="sm" variant="secondary" className="!bg-red-100 !text-red-700 !p-2"><TrashIcon className="h-4 w-4"/></Button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedRowId === l.id && (
                                    <tr className="bg-gray-50"><td colSpan={8}><ExpandedRowContent report={l}/></td></tr>
                                )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="p-3 flex justify-between items-center text-sm">
                    <p>Halaman {currentPage} dari {Math.ceil(filteredAndSortedLaporan.length / ROWS_PER_PAGE)}</p>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeftIcon className="h-4 w-4"/></Button>
                        <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAndSortedLaporan.length / ROWS_PER_PAGE), p+1))} disabled={currentPage * ROWS_PER_PAGE >= filteredAndSortedLaporan.length}><ChevronRightIcon className="h-4 w-4"/></Button>
                    </div>
                </div>
            </Card>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Konfirmasi Aksi">
                <p>Anda yakin ingin <strong>{bulkAction?.title.toLowerCase()}</strong> untuk {selectedRows.size} laporan yang dipilih?</p>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Batal</Button>
                    <Button onClick={handleBulkAction}>Ya, Lanjutkan</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminReportList;