import { GeoJson } from "./geo-json.model";
import { Image } from "./image.model";
import { Note } from "./note.model";

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
  avatar: Image;
  notes: Array<Note>;
}

export const Roles = {
  MANAGER: "MANAGER",
  TECHNICIAN: "TECHNICIAN",
  READER: "READER"
}