const buildPaginationResponse = (page, limit, total, itemsCount) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    totalPages,
    totalItems: total,
    itemsPerPage,
    hasNext: skip + itemsCount < total,
    hasPrev: currentPage > 1
  };
};

const getPaginationParams = (page = 1, limit = 10) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    skip,
    limit: itemsPerPage,
    page: currentPage
  };
};

module.exports = {
  buildPaginationResponse,
  getPaginationParams
};
