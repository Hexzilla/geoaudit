import { GeoJson } from "./geo-json.model";

export class User {
  blocked: boolean;
  confirmed: true;
  created_at: string;
  email: string;
  id: number;
  provider: string;
  updated_at: string;
  username: string;
  role: {
    description: string,
    id: number,
    name: string,
    type: string
  };
  home: GeoJson;
  work: GeoJson;
}
