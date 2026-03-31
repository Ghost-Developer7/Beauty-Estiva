namespace BeautyEstiva.Desktop.Services;

public interface ITokenStorageService
{
    string? GetToken();
    void SaveToken(string token);
    void ClearToken();
    bool HasToken();
}
