/**
 * Pagination DTO for handling pagination queries
 */
export class PaginationDto {
  constructor(page = 1, pageSize = 10, sortBy = null, sortOrder = 'asc') {
    this.page = Math.max(1, parseInt(page) || 1);
    this.pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));
    this.skip = (this.page - 1) * this.pageSize;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  }

  toQuery() {
    return {
      skip: this.skip,
      take: this.pageSize,
      orderBy: this.sortBy ? { [this.sortBy]: this.sortOrder } : undefined,
    };
  }

  static fromQuery(queryParams) {
    return new PaginationDto(
      queryParams.page,
      queryParams.pageSize,
      queryParams.sortBy,
      queryParams.sortOrder
    );
  }
}

















