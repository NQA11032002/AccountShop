export interface AiCourseLesson {
  id: number;
  title: string;
  content?: string | null;
  video_url?: string | null;
  sort_order: number;
  is_active?: boolean;
}

export interface AiCourseSummary {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  level?: string | null;
  /** Thời gian hoàn thành, ví dụ: "2 giờ", "1 tuần" */
  duration?: string | null;
  /** Nội dung / đề cương khóa học */
  content_outline?: string | null;
  sort_order: number;
  lessons_count?: number;
  enrollments_count?: number;
  is_active?: boolean;
  /** Đã đăng ký học (khi có session) */
  is_enrolled?: boolean;
  lessons?: AiCourseLesson[];
  created_at?: string;
  updated_at?: string;
}

export interface AiCourseDetail extends AiCourseSummary {
  lessons: AiCourseLesson[];
}

export interface AiCourseListResponse {
  success: boolean;
  data: AiCourseSummary[];
}

export interface AiCourseDetailResponse {
  success: boolean;
  data: AiCourseDetail;
}
