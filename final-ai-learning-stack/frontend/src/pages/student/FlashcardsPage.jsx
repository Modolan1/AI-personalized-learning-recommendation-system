import { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { studentService } from '../../services/studentService';

export default function FlashcardsPage() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => { 
    studentService.getFlashcards()
      .then((res) => { setError(''); setCards(res.data); })
      .catch((err) => { console.error('Failed to load flashcards:', err); setError('Failed to load flashcards'); });
  }, []);
  const current = cards[index];

  const next = async () => {
    try {
      if (current) await studentService.trackFlashcardReview(current._id);
      setIndex((prev) => (cards.length ? (prev + 1) % cards.length : 0));
    } catch (err) {
      console.error('Failed to track review:', err);
    }
  };

  return (
    <StudentLayout>
      <div className="mx-auto max-w-3xl">
        {error && <div className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</div>}
        {current ? (
          <Card>
            <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">{current.category?.name} • {current.difficulty}</div>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">{current.question}</h2>
            <p className="mt-4 text-slate-600">{current.answer}</p>
            <div className="mt-3 text-sm text-slate-500">{current.course?.title}</div>
            <div className="mt-6 flex justify-between">
              <div className="text-sm text-slate-500">{index + 1} of {cards.length}</div>
              <Button onClick={next}>Review & Next</Button>
            </div>
          </Card>
        ) : (
          <Card><div className="text-slate-500">No flashcards available yet.</div></Card>
        )}
      </div>
    </StudentLayout>
  );
}
