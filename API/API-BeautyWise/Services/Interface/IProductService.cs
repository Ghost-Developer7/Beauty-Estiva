using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IProductService
    {
        // Products
        Task<List<ProductListDto>> GetAllProductsAsync(int tenantId);
        Task<ProductListDto?> GetProductByIdAsync(int id, int tenantId);
        Task<int> CreateProductAsync(int tenantId, int userId, ProductCreateDto dto);
        Task UpdateProductAsync(int id, int tenantId, ProductUpdateDto dto);
        Task DeleteProductAsync(int id, int tenantId);

        // Product Sales
        Task<List<ProductSaleListDto>> GetAllSalesAsync(int tenantId, DateTime? startDate = null, DateTime? endDate = null, int? staffId = null, int? customerId = null);
        Task<PaginatedResponse<ProductSaleListDto>> GetAllSalesPaginatedAsync(int tenantId, int pageNumber, int pageSize, DateTime? startDate = null, DateTime? endDate = null, int? staffId = null, int? customerId = null);
        Task<ProductSaleListDto?> GetSaleByIdAsync(int id, int tenantId);
        Task<int> CreateSaleAsync(int tenantId, int staffId, ProductSaleCreateDto dto);
        Task UpdateSaleAsync(int id, int tenantId, ProductSaleUpdateDto dto);
        Task DeleteSaleAsync(int id, int tenantId);
    }
}
