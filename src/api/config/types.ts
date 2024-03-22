export interface GetConfigRes {
  list: Array<ConfigData>
}

export interface ConfigData {
  id: number;
  type: number;
  type_name: string;
  name: string;
  description: string;
  prompt: string;
  thumb_img?: any;
  sort: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface GetCustomizeFeatureRes {
  list: Array<CustomizeFeature>
}

export interface CustomizeFeature {
  id: number;
  name: string;
}