using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace BeautyEstiva.Desktop.Services;

/// <summary>
/// Stores JWT token securely using Windows DPAPI (DataProtectionScope.CurrentUser).
/// Token is encrypted at rest and tied to the current Windows user account.
/// </summary>
public class TokenStorageService : ITokenStorageService
{
    private static readonly string TokenFilePath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "BeautyEstiva", "auth.dat");

    public string? GetToken()
    {
        if (!File.Exists(TokenFilePath))
            return null;

        try
        {
            var encryptedBytes = File.ReadAllBytes(TokenFilePath);
            var decryptedBytes = ProtectedData.Unprotect(
                encryptedBytes, null, DataProtectionScope.CurrentUser);
            return Encoding.UTF8.GetString(decryptedBytes);
        }
        catch
        {
            // Corrupted or inaccessible — clear and return null
            ClearToken();
            return null;
        }
    }

    public void SaveToken(string token)
    {
        var directory = Path.GetDirectoryName(TokenFilePath)!;
        if (!Directory.Exists(directory))
            Directory.CreateDirectory(directory);

        var plainBytes = Encoding.UTF8.GetBytes(token);
        var encryptedBytes = ProtectedData.Protect(
            plainBytes, null, DataProtectionScope.CurrentUser);

        File.WriteAllBytes(TokenFilePath, encryptedBytes);
    }

    public void ClearToken()
    {
        if (File.Exists(TokenFilePath))
            File.Delete(TokenFilePath);
    }

    public bool HasToken()
    {
        return File.Exists(TokenFilePath);
    }
}
