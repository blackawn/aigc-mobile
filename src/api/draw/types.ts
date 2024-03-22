import { editSegment } from '.'

export interface GetSegmentDetailRes {
  list: Array<SegmentData>;
  content: string;
}

export interface SegmentData {
  id: number;
  scene: string;
  description: string;
  roles: string[];
  is_roles: string[];
  is_draw: number;
  ratio: string;
  style_id: number;
  task_id: string;
  imageUrl: string;
  imageUrl_1: string;
  status: number;
  status_text: string;
  draw_status: string;
  draw_progress: string;
  download_status: number;
  type: number;
  U1: Task;
  U2: Task;
  U3: Task;
  U4: Task;
  V1: Task;
  V2: Task;
  V3: Task;
  V4: Task;
  RE: Task;
}

interface Task {
  task_id: number | string;
  draw_task_id: number | string;
  imageUrl: string;
  status: number;
  status_text: string;
  draw_status: string;
  draw_progress: string;
  download_status: number;
  type: number;
}

export interface GetSegmentImagesTaskListParams {
  segment_id: number
  novel_id: number
}

export interface SegmentImagesTaskList {
  list: Array<SegmentImagesTask>;
}

export interface SegmentImagesTask {
  task_id: string;
  origin_task_id: string;
  action: string;
  imageUrl: string;
  status: number;
  status_text: string;
  draw_status: string;
  draw_progress: string;
  download_status: number;
}

export interface EditSegmentParams extends SegmentData {
  novel_id: number
} 

export interface SaveSegmentParams {
  novel_id: number
  chapter: number
  messages: Array<SegmentMessage>
} 

export interface SegmentMessage {
  scene: string;
  description: string;
  roles: string[];
  is_roles: string[];
  is_draw: boolean;
  ready_draw: boolean;
  checked: boolean;
  ratio?: string;
  style_id?: number;
}