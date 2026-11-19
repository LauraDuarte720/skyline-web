// One extra service of an airline (backend: ExtraServiceResponse)
export interface ExtraService {
    id: string;
    nameService: string;
    description: string;
    nationalPrice: number;       // price when the flight is NATIONAL
    internationalPrice: number;  // price when the flight is INTERNATIONAL
}

// One page of results (backend: PageResponse<T>). T is the type of each element.
export interface Page<T> {
    content: T[];          // the elements of this page
    totalElements: number; // how many there are in all the pages
    totalPages: number;
    number: number;        // number of this page, starting at 0
    size: number;          // elements per page
}

// POST /api/extra_services (backend: CreateExtraServicerRequest).
// The airline is not sent: the backend takes it from the token.
export interface CreateExtraServiceRequest {
    nameService: string;
    description: string;
    nationalPrice: number;       // 0 or more
    internationalPrice: number;  // 0 or more
}