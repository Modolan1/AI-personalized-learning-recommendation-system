import { instructorContentRepository } from '../repositories/instructorContentRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const instructorService = {
  getProfile: (instructorId) => userRepository.findById(instructorId),

  async updateProfile(instructorId, data) {
    const profile = await userRepository.updateById(instructorId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      preferredSubject: data.preferredSubject,
      preferredLearningStyle: data.preferredLearningStyle,
      learningGoal: data.learningGoal,
      skillLevel: data.skillLevel,
      weeklyLearningGoalHours: data.weeklyLearningGoalHours,
    });
    if (!profile) throw new Error('Instructor not found');
    return profile;
  },

  async getDashboard(instructorId) {
    const content = await instructorContentRepository.findByInstructor(instructorId);
    const videos = content.filter((c) => c.contentType === 'video');
    const documents = content.filter((c) => c.contentType === 'document');
    const totalViews = content.reduce((sum, c) => sum + c.viewCount, 0);

    return {
      stats: {
        totalContent: content.length,
        totalVideos: videos.length,
        totalDocuments: documents.length,
        totalViews,
      },
      recentContent: content.slice(0, 6),
    };
  },

  async listContent(instructorId) {
    return instructorContentRepository.findByInstructor(instructorId);
  },

  async getCategories() {
    return categoryRepository.findAll();
  },

  async createContent(instructorId, data, file) {
    const documentFile = Array.isArray(file?.file) ? file.file[0] : file;
    const videoFile = Array.isArray(file?.videoFile) ? file.videoFile[0] : null;

    if (!data.title || !data.contentType) {
      throw new Error('Title and content type are required');
    }

    if (data.contentType === 'video') {
      const videoSource = videoFile ? `/uploads/instructor-docs/${videoFile.filename}` : (data.videoUrl || '').trim();
      if (!videoSource) throw new Error('Video URL or uploaded video file is required');
      return instructorContentRepository.create({
        instructor: instructorId,
        title: data.title,
        description: data.description || '',
        contentType: 'video',
        videoUrl: videoSource,
        category: data.category || null,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        isPublished: data.isPublished !== 'false',
      });
    }

    if (data.contentType === 'document') {
      if (!documentFile) throw new Error('A document file is required');
      return instructorContentRepository.create({
        instructor: instructorId,
        title: data.title,
        description: data.description || '',
        contentType: 'document',
        fileUrl: `/uploads/instructor-docs/${documentFile.filename}`,
        originalFileName: documentFile.originalname,
        category: data.category || null,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        isPublished: data.isPublished !== 'false',
      });
    }

    throw new Error('Invalid content type');
  },

  async updateContent(instructorId, contentId, data, file) {
    const documentFile = Array.isArray(file?.file) ? file.file[0] : file;
    const videoFile = Array.isArray(file?.videoFile) ? file.videoFile[0] : null;

    const existing = await instructorContentRepository.findByInstructorAndId(instructorId, contentId);
    if (!existing) throw new Error('Content not found or access denied');

    const updates = {
      title: data.title || existing.title,
      description: data.description ?? existing.description,
      category: data.category || existing.category,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : existing.tags,
      isPublished: data.isPublished !== undefined ? data.isPublished !== 'false' : existing.isPublished,
    };

    if (existing.contentType === 'video') {
      if (videoFile) {
        updates.videoUrl = `/uploads/instructor-docs/${videoFile.filename}`;
      } else if (data.videoUrl) {
        updates.videoUrl = data.videoUrl;
      }
    }

    if (existing.contentType === 'document' && documentFile) {
      updates.fileUrl = `/uploads/instructor-docs/${documentFile.filename}`;
      updates.originalFileName = documentFile.originalname;
    }

    return instructorContentRepository.updateById(contentId, updates);
  },

  async deleteContent(instructorId, contentId) {
    const existing = await instructorContentRepository.findByInstructorAndId(instructorId, contentId);
    if (!existing) throw new Error('Content not found or access denied');
    await instructorContentRepository.deleteById(contentId);
    return { deleted: true };
  },

  async getContentById(instructorId, contentId) {
    const content = await instructorContentRepository.findByInstructorAndId(instructorId, contentId);
    if (!content) throw new Error('Content not found or access denied');
    return content;
  },

  async getPublishedContent(filter = {}) {
    const query = {};
    if (filter.contentType) query.contentType = filter.contentType;
    if (filter.category) query.category = filter.category;
    return instructorContentRepository.findAllPublished(query);
  },
};
