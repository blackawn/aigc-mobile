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
  task_id: string | number;
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

export interface ActionDrawParams {
  ids: Array<number>;
  novel_id: number
  style_id: number
  type: number
}

export interface GetDrawProgressParams {
  action?: string
  ids: Array<number>;
}

export type GetDrawProgressRes = Array<DrawProgress>

export interface DrawProgress {
  task_id: string;
  draw_task_id: string;
  imageUrl: string;
  status: number; // 0 未开始 1 处理成功  2 排队中 3 正在处理 4 正在下载 5 处理失败 7 可能存在敏感词
  status_text: string;
  draw_status: string;
  draw_progress: string;
  download_status: number;
  type: number;
  id: number;
}

export interface TransformDrawParams {
  novel_id: number
  segment_id: number
  action: string  //U1 U2 U3 U4 V1 V2 V3 V4 RE
  task_id: string | number,
  type: number // 1:midjourney, 2: gpt dalle-3
}