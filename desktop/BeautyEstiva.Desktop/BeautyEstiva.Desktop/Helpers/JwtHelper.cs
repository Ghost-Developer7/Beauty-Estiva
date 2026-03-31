using System.Text;
using System.Text.Json;
using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Helpers;

public static class JwtHelper
{
    public static JwtPayload? DecodeToken(string token)
    {
        try
        {
            var parts = token.Split('.');
            if (parts.Length != 3) return null;

            var payload = parts[1]
                .Replace('-', '+')
                .Replace('_', '/');

            switch (payload.Length % 4)
            {
                case 2: payload += "=="; break;
                case 3: payload += "="; break;
            }

            var bytes = Convert.FromBase64String(payload);
            var json = Encoding.UTF8.GetString(bytes);
            return JsonSerializer.Deserialize<JwtPayload>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            return null;
        }
    }

    public static bool IsTokenExpired(string token)
    {
        var payload = DecodeToken(token);
        if (payload == null) return true;
        var expDate = DateTimeOffset.FromUnixTimeSeconds(payload.Exp);
        return expDate <= DateTimeOffset.UtcNow;
    }

    public static List<string> ExtractRoles(JwtPayload payload)
    {
        if (payload.Role == null) return [];

        if (payload.Role is JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.Array)
                return element.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => s != "").ToList();

            if (element.ValueKind == JsonValueKind.String)
            {
                var val = element.GetString();
                return string.IsNullOrEmpty(val) ? [] : [val];
            }
        }

        var str = payload.Role.ToString();
        return string.IsNullOrEmpty(str) ? [] : [str];
    }
}
