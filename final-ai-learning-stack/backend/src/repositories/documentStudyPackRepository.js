import DocumentStudyPack from '../models/DocumentStudyPack.js';

export const documentStudyPackRepository = {
  create: (data) => DocumentStudyPack.create(data),

  findByStudent(studentId, searchTerm = '') {
    const query = { student: studentId };
    const trimmed = (searchTerm || '').trim();

    if (trimmed) {
      query.$or = [
        { fileName: { $regex: trimmed, $options: 'i' } },
        { summary: { $regex: trimmed, $options: 'i' } },
        { keyPoints: { $elemMatch: { $regex: trimmed, $options: 'i' } } },
      ];
    }

    return DocumentStudyPack.find(query).sort({ createdAt: -1 });
  },

  findByIdAndStudent(id, studentId) {
    return DocumentStudyPack.findOne({ _id: id, student: studentId });
  },

  appendAttempt(id, studentId, attempt) {
    return DocumentStudyPack.findOneAndUpdate(
      { _id: id, student: studentId },
      { $push: { attempts: attempt } },
      { new: true }
    );
  },

  appendChatMessage(id, studentId, message) {
    return DocumentStudyPack.findOneAndUpdate(
      { _id: id, student: studentId },
      { $push: { chatHistory: message } },
      { new: true }
    );
  },

  countByStudent(studentId) {
    return DocumentStudyPack.countDocuments({ student: studentId });
  },
};
