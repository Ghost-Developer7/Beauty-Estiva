import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/appointment_models.dart';

class StaffScreen extends StatefulWidget {
  const StaffScreen({super.key});

  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  final _api = ApiService();
  List<StaffMember> _staff = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final res = await _api.get('/staff',
        fromData: (d) => (d as List).map((e) => StaffMember.fromJson(e)).toList());
    if (mounted) {
      setState(() {
        _staff = res.data ?? [];
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Personel', style: TextStyle(
              color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _staff.isEmpty
                    ? const Center(child: Text('Personel bulunamadi', style: TextStyle(color: AppColors.textDim)))
                    : ListView.separated(
                        itemCount: _staff.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, index) {
                          final s = _staff[index];
                          return Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.cardBg,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Row(
                              children: [
                                // Avatar
                                Container(
                                  width: 44, height: 44,
                                  decoration: BoxDecoration(
                                    gradient: AppColors.pinkGradient,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${s.name.isNotEmpty ? s.name[0] : '?'}${s.surname.isNotEmpty ? s.surname[0] : '?'}',
                                      style: const TextStyle(color: Color(0xFF2e174e),
                                          fontSize: 14, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(s.fullName, style: const TextStyle(
                                          color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 2),
                                      Text(s.email, style: const TextStyle(
                                          color: AppColors.textDim, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                // Roles
                                Text(s.rolesDisplay, style: const TextStyle(
                                    color: AppColors.textMuted, fontSize: 12)),
                                const SizedBox(width: 12),
                                // Status
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: s.isActive
                                        ? AppColors.green.withValues(alpha: 0.15)
                                        : AppColors.textDim.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    s.isActive ? 'Aktif' : 'Pasif',
                                    style: TextStyle(
                                      color: s.isActive ? AppColors.green : AppColors.textDim,
                                      fontSize: 11, fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
