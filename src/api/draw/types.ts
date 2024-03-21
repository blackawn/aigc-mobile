
export interface GetDrawResultDetailRes {
  list: List[];
  content: string;
}

interface List {
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
  U1: Control;
  U2: Control;
  U3: Control;
  U4: Control;
  V1: Control;
  V2: Control;
  V3: Control;
  V4: Control;
  RE: Control;
}

interface Control {
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