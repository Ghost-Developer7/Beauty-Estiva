using API_BeautyWise.Helpers.Interface;

namespace API_BeautyWise.Helpers
{
    public class TenantIdentifierGenerator : ITenantIdentifierGenerator
    {
        public int GenerateTenantUuid()
        {
            return Random.Shared.Next(100000, 999999);
        }
    }
}
