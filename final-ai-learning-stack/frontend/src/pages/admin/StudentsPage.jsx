import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import { adminService } from '../../services/adminService';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  useEffect(() => { adminService.getStudents().then((res) => setStudents(res.data)); }, []);
  return (
    <AdminLayout>
      <Card>
        <h3 className="mb-4 text-lg font-semibold">Students</h3>
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student.id || student._id} className="rounded-xl border p-4">
              <div className="font-medium">{student.firstName} {student.lastName}</div>
              <div className="text-sm text-slate-500">{student.email}</div>
              <div className="mt-1 text-xs text-slate-400">{student.preferredSubject || 'No preferred subject'} • {student.skillLevel}</div>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}
