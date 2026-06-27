using Airmax_Payroll_System.Models.DeviceLog;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace Airmax_Payroll_System.Services
{
    public class AttendanceFetchCacheService
    {
        private readonly ConcurrentDictionary<string, AttendanceFetchBatch> _batches = new();

        public string CreateBatch(string fromDate, string toDate, string username)
        {
            var batchKey = Guid.NewGuid().ToString("N");

            _batches[batchKey] = new AttendanceFetchBatch
            {
                BatchKey = batchKey,
                FromDate = fromDate,
                ToDate = toDate,
                Username = username,
                IsCompleted = false,
                CreatedAt = DateTime.Now
            };

            return batchKey;
        }

        public AttendanceFetchBatch GetBatch(string batchKey)
        {
            if (_batches.TryGetValue(batchKey, out var batch))
            {
                return batch;
            }

            return null;
        }

        public void AddLogs(string batchKey, List<DeviceLog> logs)
        {
            var batch = GetBatch(batchKey);

            if (batch == null || logs == null)
            {
                return;
            }

            lock (batch.LockObject)
            {
                batch.Logs.AddRange(logs);
                batch.TotalLoaded = batch.Logs.Count;
            }
        }

        public void CompleteBatch(string batchKey)
        {
            var batch = GetBatch(batchKey);

            if (batch != null)
            {
                batch.IsCompleted = true;
                batch.CompletedAt = DateTime.Now;
            }
        }

        public List<DeviceLog> GetPage(string batchKey, int page, int pageSize)
        {
            var batch = GetBatch(batchKey);

            if (batch == null)
            {
                return new List<DeviceLog>();
            }

            lock (batch.LockObject)
            {
                return batch.Logs
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
            }
        }

        public List<DeviceLog> GetAllLogs(string batchKey)
        {
            var batch = GetBatch(batchKey);

            if (batch == null)
            {
                return new List<DeviceLog>();
            }

            lock (batch.LockObject)
            {
                return batch.Logs.ToList();
            }
        }
    }

    public class AttendanceFetchBatch
    {
        public string BatchKey { get; set; }

        public string FromDate { get; set; }

        public string ToDate { get; set; }

        public string Username { get; set; }

        public List<DeviceLog> Logs { get; set; } = new();

        public int TotalLoaded { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public object LockObject { get; set; } = new();
    }
}