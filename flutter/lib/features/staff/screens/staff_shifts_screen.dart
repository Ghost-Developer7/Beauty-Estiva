import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/staff_models.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_loading.dart';

// ── Avatar gradient pairs ──
const _avatarGradients = [
  LinearGradient(colors: [Color(0xFFffd1dc), Color(0xFFf3a4ff)]),
  LinearGradient(colors: [Color(0xFFddd6fe), Color(0xFFa78bfa)]),
  LinearGradient(colors: [Color(0xFFbfdbfe), Color(0xFF60a5fa)]),
  LinearGradient(colors: [Color(0xFFa7f3d0), Color(0xFF34d399)]),
  LinearGradient(colors: [Color(0xFFfde68a), Color(0xFFfbbf24)]),
  LinearGradient(colors: [Color(0xFFa5f3fc), Color(0xFF22d3ee)]),
];

class StaffShiftsScreen extends StatefulWidget {
  const StaffShiftsScreen({super.key});

  @override
  State<StaffShiftsScreen> createState() => _StaffShiftsScreenState();
}

class _StaffShiftsScreenState extends State<StaffShiftsScreen> {
  final _api = ApiService();
  bool _loading = true;
  String? _error;
  List<StaffWeeklyShift> _weeklyShifts = [];

  @override
  void initState() {
    super.initState();
    _loadShifts();
  }

  Future<void> _loadShifts() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final response = await _api.get<List<StaffWeeklyShift>>(
      ApiEndpoints.staffShiftsWeekly,
      fromData: (data) => (data as List)
          .map((e) => StaffWeeklyShift.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    if (!mounted) return;
    if (response.success && response.data != null) {
      setState(() {
        _weeklyShifts = response.data!;
        _loading = false;
      });
    } else {
      setState(() {
        _error = response.error?.message ?? 'Vardiya verileri yüklenemedi';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return Padding(
      padding: AppSpacing.paddingXxl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          Text('Vardiya Yönetimi', style: AppTextStyles.heading2(c)),
          const SizedBox(height: 4),
          Text(
            'Personel çalışma saatlerini ve mola sürelerini yönetin',
            style: AppTextStyles.bodyMuted(c),
          ),
          AppSpacing.verticalLg,

          // ── Body ──
          Expanded(
            child: _loading
                ? const AppLoading()
                : _error != null
                    ? AppErrorState(
                        message: _error!,
                        onRetry: _loadShifts,
                      )
                    : _weeklyShifts.isEmpty
                        ? const AppEmptyState(
                            message: 'Henüz vardiya verisi bulunamadı',
                            icon: Icons.schedule,
                          )
                        : ListView.separated(
                            itemCount: _weeklyShifts.length,
                            separatorBuilder: (_, __) =>
                                AppSpacing.verticalMd,
                            itemBuilder: (context, index) {
                              return _StaffShiftCard(
                                weeklyShift: _weeklyShifts[index],
                                gradient: _avatarGradients[
                                    index % _avatarGradients.length],
                                onSaved: _loadShifts,
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

// ── Staff Shift Card (Collapsible) ──
class _StaffShiftCard extends StatefulWidget {
  final StaffWeeklyShift weeklyShift;
  final LinearGradient gradient;
  final VoidCallback onSaved;

  const _StaffShiftCard({
    required this.weeklyShift,
    required this.gradient,
    required this.onSaved,
  });

  @override
  State<_StaffShiftCard> createState() => _StaffShiftCardState();
}

class _StaffShiftCardState extends State<_StaffShiftCard> {
  bool _expanded = false;
  bool _editMode = false;
  bool _saving = false;

  // Editable copies of shift data
  late List<_EditableShift> _editableShifts;

  @override
  void initState() {
    super.initState();
    _initEditableShifts();
  }

  @override
  void didUpdateWidget(covariant _StaffShiftCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.weeklyShift != widget.weeklyShift) {
      _initEditableShifts();
    }
  }

  void _initEditableShifts() {
    _editableShifts = List.generate(7, (dayIndex) {
      final existing = widget.weeklyShift.shifts
          .where((s) => s.dayOfWeek == dayIndex)
          .toList();
      if (existing.isNotEmpty) {
        final s = existing.first;
        return _EditableShift(
          dayOfWeek: dayIndex,
          startTime: s.startTime,
          endTime: s.endTime,
          breakStartTime: s.breakStartTime ?? '',
          breakEndTime: s.breakEndTime ?? '',
          isWorkingDay: s.isWorkingDay,
        );
      }
      return _EditableShift(
        dayOfWeek: dayIndex,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isWorkingDay: dayIndex < 5,
      );
    });
  }

  Future<void> _applyDefaults() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Varsayılan Uygula'),
        content: const Text(
            'Tüm vardiyalar varsayılan değerlere sıfırlanacak.\nHafta içi: 09:00-18:00, Mola: 12:00-13:00\nHafta sonu: Kapalı\n\nDevam etmek istiyor musunuz?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('İptal')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Uygula',
                  style: TextStyle(color: AppColors.orange))),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() {
      for (int i = 0; i < _editableShifts.length; i++) {
        final s = _editableShifts[i];
        if (s.dayOfWeek < 5) {
          s.startTime = '09:00';
          s.endTime = '18:00';
          s.breakStartTime = '12:00';
          s.breakEndTime = '13:00';
          s.isWorkingDay = true;
        } else {
          s.startTime = '';
          s.endTime = '';
          s.breakStartTime = '';
          s.breakEndTime = '';
          s.isWorkingDay = false;
        }
      }
    });
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final api = ApiService();
    final shiftsData = _editableShifts.map((e) => e.toJson()).toList();
    final response = await api.put(
      ApiEndpoints.staffShifts(widget.weeklyShift.staffId),
      data: shiftsData,
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (response.success) {
      setState(() => _editMode = false);
      widget.onSaved();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vardiya bilgileri kaydedildi'),
            backgroundColor: AppColors.green,
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.error?.message ?? 'Kayıt başarısız'),
            backgroundColor: AppColors.red,
          ),
        );
      }
    }
  }

  String _getInitials(String fullName) {
    final parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return fullName.isNotEmpty ? fullName[0].toUpperCase() : '?';
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final name = widget.weeklyShift.staffFullName;

    return Container(
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        children: [
          // ── Header ──
          InkWell(
            borderRadius: BorderRadius.vertical(
              top: const Radius.circular(AppSpacing.radiusLg),
              bottom: _expanded
                  ? Radius.zero
                  : const Radius.circular(AppSpacing.radiusLg),
            ),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Row(
                children: [
                  AppAvatar(
                    initials: _getInitials(name),
                    gradient: widget.gradient,
                    size: 40,
                    borderRadius: AppSpacing.radiusSm,
                    fontSize: 14,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(name, style: AppTextStyles.bodyLarge(c)),
                  ),
                  if (!_editMode)
                    TextButton.icon(
                      onPressed: () => setState(() {
                        _expanded = true;
                        _editMode = true;
                      }),
                      icon: const Icon(Icons.edit_outlined, size: 16),
                      label: Text('Düzenle',
                          style: AppTextStyles.caption(c)
                              .copyWith(color: AppColors.primary)),
                    ),
                  if (_editMode)
                    TextButton.icon(
                      onPressed: _applyDefaults,
                      icon: const Icon(Icons.restore, size: 16,
                          color: AppColors.orange),
                      label: Text('Varsayılan',
                          style: AppTextStyles.caption(c)
                              .copyWith(color: AppColors.orange)),
                    ),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: c.textDim,
                  ),
                ],
              ),
            ),
          ),

          // ── Body (expanded) ──
          if (_expanded) ...[
            Divider(height: 1, color: c.cardBorder),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // ── Table header ──
                  _ShiftTableHeader(c: c),
                  const SizedBox(height: 8),
                  // ── Day rows ──
                  ...List.generate(7, (dayIndex) {
                    final shift = _editableShifts[dayIndex];
                    return _ShiftDayRow(
                      c: c,
                      shift: shift,
                      editMode: _editMode,
                      onChanged: (updated) {
                        setState(() => _editableShifts[dayIndex] = updated);
                      },
                    );
                  }),
                  // ── Action buttons ──
                  if (_editMode) ...[
                    AppSpacing.verticalLg,
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: _saving
                              ? null
                              : () {
                                  _initEditableShifts();
                                  setState(() => _editMode = false);
                                },
                          child: Text('İptal',
                              style: AppTextStyles.body(c)
                                  .copyWith(color: c.textMuted)),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius:
                                BorderRadius.circular(AppSpacing.radiusMd),
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius:
                                  BorderRadius.circular(AppSpacing.radiusMd),
                              onTap: _saving ? null : _save,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 24, vertical: 10),
                                child: _saving
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: AppColors.primary,
                                        ),
                                      )
                                    : const Text('Kaydet',
                                        style: AppTextStyles.buttonSmall),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Shift table header ──
class _ShiftTableHeader extends StatelessWidget {
  final AppColors c;
  const _ShiftTableHeader({required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: c.tableHeaderBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Row(
        children: [
          SizedBox(
              width: 100,
              child: Text('GÜN', style: AppTextStyles.tableHeader(c))),
          SizedBox(
              width: 120,
              child: Text('ÇALIŞMA SAATİ', style: AppTextStyles.tableHeader(c))),
          SizedBox(
              width: 120,
              child: Text('MOLA SAATİ', style: AppTextStyles.tableHeader(c))),
          SizedBox(
              width: 80,
              child: Text('DURUM', style: AppTextStyles.tableHeader(c))),
        ],
      ),
    );
  }
}

// ── Editable shift model ──
class _EditableShift {
  final int dayOfWeek;
  String startTime;
  String endTime;
  String breakStartTime;
  String breakEndTime;
  bool isWorkingDay;

  _EditableShift({
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.breakStartTime,
    required this.breakEndTime,
    required this.isWorkingDay,
  });

  Map<String, dynamic> toJson() => {
        'dayOfWeek': dayOfWeek,
        'startTime': startTime,
        'endTime': endTime,
        if (breakStartTime.isNotEmpty) 'breakStartTime': breakStartTime,
        if (breakEndTime.isNotEmpty) 'breakEndTime': breakEndTime,
        'isWorkingDay': isWorkingDay,
      };
}

// ── Single day row ──
class _ShiftDayRow extends StatelessWidget {
  final AppColors c;
  final _EditableShift shift;
  final bool editMode;
  final ValueChanged<_EditableShift> onChanged;

  const _ShiftDayRow({
    required this.c,
    required this.shift,
    required this.editMode,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final dayName = StaffShiftItem.dayName(shift.dayOfWeek);
    final isOdd = shift.dayOfWeek.isOdd;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isOdd ? c.tableRowAlt : Colors.transparent,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          // Day name
          SizedBox(
            width: 100,
            child: Text(dayName, style: AppTextStyles.tableCellBold(c)),
          ),

          // Work time
          SizedBox(
            width: 120,
            child: editMode
                ? Row(
                    children: [
                      _TimeField(
                        value: shift.startTime,
                        enabled: shift.isWorkingDay,
                        onChanged: (v) {
                          shift.startTime = v;
                          onChanged(shift);
                        },
                      ),
                      Text(' - ', style: AppTextStyles.tableCell(c)),
                      _TimeField(
                        value: shift.endTime,
                        enabled: shift.isWorkingDay,
                        onChanged: (v) {
                          shift.endTime = v;
                          onChanged(shift);
                        },
                      ),
                    ],
                  )
                : Text(
                    shift.isWorkingDay
                        ? '${shift.startTime} - ${shift.endTime}'
                        : '--:-- - --:--',
                    style: AppTextStyles.tableCell(c),
                  ),
          ),

          // Break time
          SizedBox(
            width: 120,
            child: editMode
                ? Row(
                    children: [
                      _TimeField(
                        value: shift.breakStartTime,
                        enabled: shift.isWorkingDay,
                        onChanged: (v) {
                          shift.breakStartTime = v;
                          onChanged(shift);
                        },
                      ),
                      Text(' - ', style: AppTextStyles.tableCell(c)),
                      _TimeField(
                        value: shift.breakEndTime,
                        enabled: shift.isWorkingDay,
                        onChanged: (v) {
                          shift.breakEndTime = v;
                          onChanged(shift);
                        },
                      ),
                    ],
                  )
                : Text(
                    shift.isWorkingDay && shift.breakStartTime.isNotEmpty
                        ? '${shift.breakStartTime} - ${shift.breakEndTime}'
                        : '--:-- - --:--',
                    style: AppTextStyles.bodySmall(c),
                  ),
          ),

          // Working day toggle
          SizedBox(
            width: 80,
            child: editMode
                ? Switch(
                    value: shift.isWorkingDay,
                    activeThumbColor: AppColors.green,
                    onChanged: (v) {
                      shift.isWorkingDay = v;
                      onChanged(shift);
                    },
                  )
                : Icon(
                    shift.isWorkingDay ? Icons.check_circle : Icons.cancel,
                    color: shift.isWorkingDay ? AppColors.green : AppColors.red,
                    size: 20,
                  ),
          ),
        ],
      ),
    );
  }
}

// ── Time input field (compact) ──
class _TimeField extends StatefulWidget {
  final String value;
  final bool enabled;
  final ValueChanged<String> onChanged;

  const _TimeField({
    required this.value,
    required this.enabled,
    required this.onChanged,
  });

  @override
  State<_TimeField> createState() => _TimeFieldState();
}

class _TimeFieldState extends State<_TimeField> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(covariant _TimeField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      _controller.text = widget.value;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return SizedBox(
      width: 46,
      height: 32,
      child: TextField(
        controller: _controller,
        enabled: widget.enabled,
        textAlign: TextAlign.center,
        style: AppTextStyles.tableCell(c).copyWith(fontSize: 12),
        decoration: InputDecoration(
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: BorderSide(color: c.inputBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: BorderSide(color: c.inputBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
          ),
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: BorderSide(color: c.inputBorder.withValues(alpha: 0.3)),
          ),
          filled: true,
          fillColor: widget.enabled ? c.inputBg : c.inputBg.withValues(alpha: 0.3),
          isDense: true,
        ),
        onChanged: widget.onChanged,
      ),
    );
  }
}
