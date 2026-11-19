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