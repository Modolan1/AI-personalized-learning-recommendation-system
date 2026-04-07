import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { studentService } from '../../services/studentService';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => { 
    studentService.getCourseDetail(id)
      .then((res) => { setError(''); setData(res.data); })
      .catch((err) => { console.error('Failed to load course:', err); setError('Failed to load course'); });
  }, [id]);
  
  if (error) return <StudentLayout><div className="text-red-600">{error}</div></StudentLayout>;
  if (!data) return <StudentLayout><div>Loading...</div></StudentLayout>;

  const cards = data.flashcards || [];
  const currentCard = cards[currentIndex];

  const reviewCurrent = async () => {
    try {
      if (!currentCard) return;
      await studentService.trackFlashcardReview(currentCard._id);
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    } catch (err) {
      console.error('Failed to track review:', err);
    }
  };

  return (
    <StudentLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {data.course.thumbnail ? <img src={data.course.thumbnail} alt={data.course.title} className="h-56 w-full rounded-xl object-cover" /> : null}
            <div className="mt-4 text-xs font-medium uppercase tracking-wide text-indigo-600">{data.course.category?.name}</div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{data.course.title}</h1>
            <p className="mt-3 text-slate-600">{data.course.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span>{data.course.level}</span>
              <span>{data.course.durationHours} hour(s)</span>
              <span>{data.course.modules?.length || 0} modules</span>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold">Course Modules</h3>
            <div className="space-y-3">
              {data.course.modules?.map((module, idx) => (
                <div key={idx} className="rounded-xl border p-4">
                  <div className="font-medium">{idx + 1}. {module.title}</div>
                  <div className="text-sm text-slate-500">{module.type} • {module.durationMinutes} min</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold">Related Quizzes</h3>
            <div className="space-y-3">
              {data.quizzes.map((quiz) => (
                <div key={quiz._id} className="rounded-xl border p-4">
                  <div className="font-medium">{quiz.title}</div>
                  <div className="text-sm text-slate-500">{quiz.questions.length} questions • {quiz.difficulty}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-3 text-lg font-semibold">Your Progress</h3>
            <div className="text-sm text-slate-500">{data.progress.completionPercent}% complete</div>
            <div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-600" style={{ width: `${data.progress.completionPercent}%` }} /></div>
            <div className="mt-3 text-sm text-slate-500">{data.progress.completedModules} of {data.progress.totalModules} modules completed</div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold">Flashcard Practice</h3>
            {currentCard ? (
              <>
                <div className="rounded-xl border p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">{currentCard.difficulty}</div>
                  <div className="mt-2 font-medium text-slate-900">{currentCard.question}</div>
                  <div className="mt-3 text-sm text-slate-600">{currentCard.answer}</div>
                </div>
                <Button className="mt-4 w-full" onClick={reviewCurrent}>Mark Reviewed & Next</Button>
              </>
            ) : (
              <div className="text-sm text-slate-500">No flashcards for this course yet.</div>
            )}
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
