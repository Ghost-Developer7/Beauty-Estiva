import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/api_response.dart';
import '../../../core/models/appointment_models.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  final _api = ApiService();
  List<AppointmentListItem> _appointments = [];
  bool _loading = true;
  DateTime _selectedDate = DateTime.now();
  int _page = 1;
  int _totalPages = 1;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final startDate = _selectedDate.toIso8601String().split('T')[0];
    final endDate = _selectedDate.add(const Duration(days: 1)).toIso8601String().split('T')[0];

    final res = await _api.get('/appointment', queryParameters: {
      'startDate': startDate, 'endDate': endDate,
      'pageNumber': _page, 'pageSize': 20,
    }, fromData: (d) => PaginatedResponse.fromJson(d, AppointmentListItem.fromJson));

    if (mounted) {
      setState(() {
        if (res.success && res.data != null) {
          _appointments = res.data!.items;
          _totalPages = res.data!.totalPages;
        }
        _loading = false;
      });
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Scheduled': return const Color(0xFF3b82f6);
      case 'Confirmed': return AppColors.green;
      case 'Completed': return AppColors.cyan;
      case 'Cancelled': return AppColors.red;
      case 'NoShow': return AppColors.orange;
      default: return AppColors.of(context).textDim;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Randevular', style: TextStyle(
              color: c.textPrimary, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),

          // Date filter
          Row(
            children: [
              GestureDetector(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2030),
                  );
                  if (picked != null) {
                    _selectedDate = picked;
                    _page = 1;
                    _loadData();
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: c.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: c.cardBorder),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.calendar_today, color: c.textNav, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        '${_selectedDate.day.toString().padLeft(2, '0')}.${_selectedDate.month.toString().padLeft(2, '0')}.${_selectedDate.year}',
                        style: TextStyle(color: c.textPrimary, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _appointments.isEmpty
                    ? Center(child: Text('Randevu bulunamadi', style: TextStyle(color: c.textDim)))
                    : Container(
                        decoration: BoxDecoration(
                          color: c.cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: c.cardBorder),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: ListView.separated(
                            itemCount: _appointments.length,
                            separatorBuilder: (_, __) =>
                                Divider(height: 1, color: c.cardBorder),
                            itemBuilder: (context, index) {
                              final a = _appointments[index];
                              return ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                                leading: Text(
                                  a.startTime.contains('T')
                                      ? a.startTime.split('T')[1].substring(0, 5)
                                      : a.startTime,
                                  style: const TextStyle(color: AppColors.accent,
                                      fontSize: 14, fontWeight: FontWeight.w600),
                                ),
                                title: Text(a.customerFullName,
                                    style: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w500)),
                                subtitle: Text('${a.treatmentName} \u2022 ${a.staffFullName}',
                                    style: TextStyle(color: c.textDim, fontSize: 12)),
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _statusColor(a.status).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(a.status,
                                      style: TextStyle(color: _statusColor(a.status),
                                          fontSize: 11, fontWeight: FontWeight.w600)),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
          ),

          // Pagination
          Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(onPressed: _page > 1 ? () { _page--; _loadData(); } : null,
                    child: Text('Önceki', style: TextStyle(color: _page > 1 ? c.textNav : c.textDim))),
                Padding(padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text('$_page / $_totalPages', style: TextStyle(color: c.textDim))),
                TextButton(onPressed: _page < _totalPages ? () { _page++; _loadData(); } : null,
                    child: Text('Sonraki', style: TextStyle(color: _page < _totalPages ? c.textNav : c.textDim))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
