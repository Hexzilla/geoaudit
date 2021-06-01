export interface Format {
    ext: string;
    hash: string;
    height: number;
    mime: string;
    name: string;
    path: string;
    size: number;
    url: string;
    width: number;
}

export interface Image {
    alternativeText: string;
    caption: string;
    created_at: string;
    ext: string;
    formats: {
        large: Format;
        small: Format; 
        medium: Format;
        thumbnail: Format;
    },
    hash: string;
    height: number;
    id: number;
    mime: string;
    name: string;
    previewUrl: string;
    provider: string;
    provider_metadata: string;
    size: number;
    updated_at: string;
    url: string;
    width: number
}