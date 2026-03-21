using API_BeautyWise.DTO;
using Dapper;
using System.Data;

namespace API_BeautyWise.Services
{
    public class LogService
    {
        private readonly IDbConnection _connection;

        private const string InsertLogSql = @"
            INSERT INTO Logs
            (
                LogLevel,
                Message,
                Exception,
                Timestamp,
                UserId,
                Action,
                Controller,
                Endpoint,
                StatusCode
            )
            VALUES
            (
                @LogLevel,
                @Message,
                @Exception,
                @Timestamp,
                @UserId,
                @Action,
                @Controller,
                @Endpoint,
                @StatusCode
            )";
        public LogService(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task LogErrorAsync(LogErrorDto dto)
        {
            var log = new Log
            {
                LogLevel = (int)dto.LogLevel,
                Message = dto.Exception.Message,
                Exception = dto.Exception.ToString(),
                Timestamp = DateTime.Now,
                Action = dto.Action,
                Controller = dto.Controller,
                Endpoint = dto.Endpoint,
                UserId = dto.UserId,
                StatusCode = dto.StatusCode
            };

            try
            {
                if (_connection.State != ConnectionState.Open)
                    _connection.Open();

                await _connection.ExecuteAsync(InsertLogSql, log);
            }
            catch
            { }
        }
    }
}
