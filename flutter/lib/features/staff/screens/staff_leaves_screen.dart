import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/staff_models.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_loading.dart';
import '../../../core/widgets/app_status_badge.dart';

// ── Leave type colors ──
Color _leaveTypeColor(String type) {
  switch (type.toLowerCase()) {
    case 'yıllık':
    case 'annual':
      return const Color(0xFF3b82f6);
    case 'hastalık':
    case 'sick':
      return AppColors.red;
    case 'doğum':
    case 'maternity':
      return const Color(0xFFec4899);
    case 'ücretsiz':
    case 'unpaid':
      return AppColors.orange;
    case 'diğer':
    case 'other':
      return const Color(0xFF8b5cf6);
    default:
      return const Color(0xFF6b7280);
  }
}

String _leaveTypeLabel(String type) {
  switch (type.toLowerCase()) {
    case 'annual':
      return 'Yıllık';
    case 'sick':
      return 'Hastalık';
    case 'maternity':
      return 'Doğum';
    case 'unpaid':
      return 'Ücretsiz';
    case 'other':
      return 'Diğer';
    default:
      return type;
  }
}

// ── Status helpers ──
Color _statusColor(String status) {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'beklemede':
      return AppColors.orange;
    case 'approved':
    case 'onaylı':
      return AppColors.green;
    case 'rejected':
    case 'reddedildi':
      return AppColors.red;
    default:
      return const Color(0xFF6b7280);
  }
}

String _statusLabel(String status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Beklemede';
    case 'approved':
      return 'Onaylı';
    case 'rejected':
      return 'Reddedildi';
    default:
      return status;
  }
}

class StaffLeavesScreen extends StatefulWidget {
  const StaffLeavesScreen({super.key});

  @override
  State<StaffLeavesScreen> createState() => _StaffLeavesScreenState();
}

class _StaffLeavesScreenState extends State<StaffLeavesScreen> {
  final _api = ApiService();
  bool _loading = true;
  String? _error;
  List<StaffLeaveListItem> _leaves = [];
  List<StaffLeaveBalance> _balances = [];
  String _statusFilter = 'all'; // all, Pending, Approved, Rejected

  @override
  void initState() {
    super.initState();
    _loadLeaves();
    _loadBalances();
  }

  Future<void> _loadLeaves() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final response = await _api.get<List<StaffLeaveListItem>>(
      ApiEndpoints.staffLeaves,
      fromData: (data) => (data as List)
          .map((e) => StaffLeaveListItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    if (!mounted) return;
    if (response.success && response.data != null) {
      setState(() {
        _leaves = response.data!;
        _loading = false;
      });
    } else {
      setState(() {
        _error = response.error?.message ?? 'İzin verileri yüklenemedi';
        _loading = false;
      });
    }
  }

  Future<void> _loadBalances() async {
    final response = await _api.get<List<StaffLeaveBalance>>(
      ApiEndpoints.staffLeaveBalances,
      fromData: (data) => (data as List)
          .map((e) => StaffLeaveBalance.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    if (!mounted) return;
    if (response.success && response.data != null) {
      setState(() => _balances = response.data!);
    }
  }

  List<StaffLeaveListItem> get _filteredLeaves {
    if (_statusFilter == 'all') return _leaves;
    return _leaves.where((l) => l.status == _statusFilter).toList();
  }

  Future<void> _approveLeave(int id) async {
    final response = await _api.put(ApiEndpoints.staffLeaveApprove(id));
    if (!mounted) return;
    if (response.success) {
      _loadLeaves();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('İzin onaylandı'), backgroundColor: AppColors.green),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(response.error?.message ?? 'İşlem başarısız'),
            backgroundColor: AppColors.red),
      );
    }
  }

  Future<void> _rejectLeave(int id) async {
    final response = await _api.put(ApiEndpoints.staffLeaveReject(id));
    if (!mounted) return;
    if (response.success) {
      _loadLeaves();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('İzin reddedildi'),
            backgroundColor: AppColors.orange),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(response.error?.message ?? 'İşlem başarısız'),
            backgroundColor: AppColors.red),
      );
    }
  }

  Future<void> _deleteLeave(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('İzin Sil'),
        content: const Text('Bu izin kaydını silmek istediğinizden emin misiniz?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('İptal')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Sil', style: TextStyle(color: AppColors.red))),
        ],
      ),
    );
    if (confirm != true) return;

    final response = await _api.delete(ApiEndpoints.staffLeaveById(id));
    if (!mounted) return;
    if (response.success) {
      _loadLeaves();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('İzin kaydı silindi'),
            backgroundColor: AppColors.green),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(response.error?.message ?? 'Silme başarısız'),
            backgroundColor: AppColors.red),
      );
    }
  }

  void _showCreateDialog() {
    showDialog(
      context: context,
      builder: (ctx) => _CreateLeaveDialog(
        onCreated: () {
          _loadLeaves();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final filtered = _filteredLeaves;

    return Padding(
      padding: AppSpacing.paddingXxl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('İzin Yönetimi', style: AppTextStyles.heading2(c)),
                  const SizedBox(height: 4),
                  Text(
                    '${_leaves.length} izin kaydı',
                    style: AppTextStyles.bodyMuted(c),
                  ),
                ],
              ),
              const Spacer(),
              AppButtonSmall(
                text: 'Yeni İzin Talebi',
                icon: Icons.add,
                onPressed: _showCreateDialog,
              ),
            ],
          ),
          AppSpacing.verticalLg,

          // ── Leave Balances ──
          if (_balances.isNotEmpty) ...[
            _LeaveBalanceRow(balances: _balances),
            AppSpacing.verticalLg,
          ],

          // ── Filter chips ──
          _StatusFilterRow(
            c: c,
            selected: _statusFilter,
            onChanged: (v) => setState(() => _statusFilter = v),
          ),
          AppSpacing.verticalLg,

          // ── Table ──
          Expanded(
            child: _loading
                ? const AppLoading()
                : _error != null
                    ? AppErrorState(
                        message: _error!,
                        onRetry: _loadLeaves,
                      )
                    : filtered.isEmpty
                        ? const AppEmptyState(
                            message: 'İzin kaydı bulunamadı',
                            icon: Icons.event_busy,
                          )
                        : _LeavesTable(
                            leaves: filtered,
                            c: c,
                            onApprove: _approveLeave,
                            onReject: _rejectLeave,
                            onDelete: _deleteLeave,
                          ),
          ),
        ],
      ),
    );
  }
}

// ── Status filter row ──
class _StatusFilterRow extends StatelessWidget {
  final AppColors c;
  final String selected;
  final ValueChanged<String> onChanged;

  const _StatusFilterRow({
    required this.c,
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final filters = <String, String>{
      'all': 'Tümü',
      'Pending': 'Beklemede',
      'Approved': 'Onaylı',
      'Rejected': 'Reddedildi',
    };

    return Row(
      children: filters.entries.map((entry) {
        final isSelected = selected == entry.key;
        final chipColor = entry.key == 'all'
            ? AppColors.primary
            : _statusColor(entry.key);

        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: FilterChip(
            label: Text(entry.value),
            selected: isSelected,
            onSelected: (_) => onChanged(entry.key),
            labelStyle: TextStyle(
              color: isSelected ? c.textPrimary : c.textMuted,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
            backgroundColor: c.cardBg,
            selectedColor: chipColor,
            side: BorderSide(
              color: isSelected ? chipColor : c.cardBorder,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
            ),
            showCheckmark: false,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          ),
        );
      }).toList(),
    );
  }
}

// ── Leaves table ──
class _LeavesTable extends StatelessWidget {
  final List<StaffLeaveListItem> leaves;
  final AppColors c;
  final ValueChanged<int> onApprove;
  final ValueChanged<int> onReject;
  final ValueChanged<int> onDelete;

  const _LeavesTable({
    required this.leaves,
    required this.c,
    required this.onApprove,
    required this.onReject,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        child: SingleChildScrollView(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowColor: WidgetStateProperty.all(c.tableHeaderBg),
              dataRowColor: WidgetStateProperty.resolveWith((_) => c.cardBg),
              headingTextStyle: AppTextStyles.tableHeader(c),
              dataTextStyle: AppTextStyles.tableCell(c),
              columnSpacing: 24,
              horizontalMargin: 20,
              columns: const [
                DataColumn(label: Text('PERSONEL')),
                DataColumn(label: Text('İZİN TÜRÜ')),
                DataColumn(label: Text('TARİHLER')),
                DataColumn(label: Text('SÜRE'), numeric: true),
                DataColumn(label: Text('DURUM')),
                DataColumn(label: Text('NEDEN')),
                DataColumn(label: Text('ONAYLAYAN')),
                DataColumn(label: Text('AKSİYONLAR')),
              ],
              rows: List.generate(leaves.length, (index) {
                final leave = leaves[index];
                return DataRow(
                  color: WidgetStateProperty.resolveWith((states) {
                    if (index.isOdd) return c.tableRowAlt;
                    return c.cardBg;
                  }),
                  cells: [
                    DataCell(Text(leave.staffFullName,
                        style: AppTextStyles.tableCellBold(c))),
                    DataCell(_LeaveTypeBadge(type: leave.leaveType)),
                    DataCell(Text(
                        '${_formatDate(leave.startDate)} - ${_formatDate(leave.endDate)}')),
                    DataCell(Text('${leave.durationDays} gün',
                        style: AppTextStyles.tableCellBold(c))),
                    DataCell(AppStatusBadge(
                      label: _statusLabel(leave.status),
                      color: _statusColor(leave.status),
                    )),
                    DataCell(Text(leave.reason ?? '-',
                        style: AppTextStyles.bodySmall(c))),
                    DataCell(Text(leave.approvedByName ?? '-',
                        style: AppTextStyles.bodySmall(c))),
                    DataCell(_LeaveActionsCell(
                      leave: leave,
                      onApprove: onApprove,
                      onReject: onReject,
                      onDelete: onDelete,
                    )),
                  ],
                );
              }),
            ),
          ),
        ),
      ),
    );
  }

  String _formatDate(String date) {
    if (date.isEmpty) return '-';
    try {
      final d = DateTime.parse(date);
      return '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
    } catch (_) {
      return date;
    }
  }
}

// ── Leave type badge ──
class _LeaveTypeBadge extends StatelessWidget {
  final String type;
  const _LeaveTypeBadge({required this.type});

  @override
  Widget build(BuildContext context) {
    final color = _leaveTypeColor(type);
    final label = _leaveTypeLabel(type);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: AppTextStyles.badge(color: color),
      ),
    );
  }
}

// ── Actions cell ──
class _LeaveActionsCell extends StatelessWidget {
  final StaffLeaveListItem leave;
  final ValueChanged<int> onApprove;
  final ValueChanged<int> onReject;
  final ValueChanged<int> onDelete;

  const _LeaveActionsCell({
    required this.leave,
    required this.onApprove,
    required this.onReject,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final isPending = leave.status.toLowerCase() == 'pending';

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (isPending) ...[
          IconButton(
            icon: const Icon(Icons.check_circle_outline,
                size: 18, color: AppColors.green),
            onPressed: () => onApprove(leave.id),
            tooltip: 'Onayla',
            splashRadius: 18,
          ),
          IconButton(
            icon: const Icon(Icons.cancel_outlined,
                size: 18, color: AppColors.red),
            onPressed: () => onReject(leave.id),
            tooltip: 'Reddet',
            splashRadius: 18,
          ),
        ],
        IconButton(
          icon: Icon(Icons.delete_outline, size: 18, color: c.textDim),
          onPressed: () => onDelete(leave.id),
          tooltip: 'Sil',
          splashRadius: 18,
        ),
      ],
    );
  }
}

// ── Create leave dialog ──
class _CreateLeaveDialog extends StatefulWidget {
  final VoidCallback onCreated;

  const _CreateLeaveDialog({required this.onCreated});

  @override
  State<_CreateLeaveDialog> createState() => _CreateLeaveDialogState();
}

class _CreateLeaveDialogState extends State<_CreateLeaveDialog> {
  final _api = ApiService();
  bool _saving = false;

  // Staff list for dropdown
  bool _loadingStaff = true;
  List<_StaffDropdownItem> _staffList = [];

  int? _selectedStaffId;
  String _selectedLeaveType = 'Yıllık';
  DateTime? _startDate;
  DateTime? _endDate;
  final _reasonController = TextEditingController();

  static const _leaveTypes = ['Yıllık', 'Hastalık', 'Doğum', 'Ücretsiz', 'Diğer'];

  @override
  void initState() {
    super.initState();
    _loadStaffList();
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _loadStaffList() async {
    final response = await _api.get<List<_StaffDropdownItem>>(
      ApiEndpoints.staff,
      fromData: (data) => (data as List)
          .map((e) => _StaffDropdownItem(
                id: e['id'] ?? 0,
                fullName: e['fullName'] ?? '${e['name'] ?? ''} ${e['surname'] ?? ''}',
              ))
          .toList(),
    );
    if (!mounted) return;
    setState(() {
      _loadingStaff = false;
      if (response.success && response.data != null) {
        _staffList = response.data!;
      }
    });
  }

  Future<void> _pickDate({required bool isStart}) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? (_startDate ?? now) : (_endDate ?? _startDate ?? now),
      firstDate: now.subtract(const Duration(days: 30)),
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      if (isStart) {
        _startDate = picked;
        if (_endDate != null && _endDate!.isBefore(picked)) {
          _endDate = picked;
        }
      } else {
        _endDate = picked;
      }
    });
  }

  Future<void> _submit() async {
    if (_selectedStaffId == null || _startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lütfen tüm zorunlu alanları doldurun'),
          backgroundColor: AppColors.orange,
        ),
      );
      return;
    }

    setState(() => _saving = true);

    final body = StaffLeaveCreate(
      staffId: _selectedStaffId,
      startDate: _startDate!.toIso8601String().split('T').first,
      endDate: _endDate!.toIso8601String().split('T').first,
      leaveType: _selectedLeaveType,
      reason: _reasonController.text.trim().isNotEmpty
          ? _reasonController.text.trim()
          : null,
    );

    final response = await _api.post(
      ApiEndpoints.staffLeaves,
      data: body.toJson(),
    );

    if (!mounted) return;
    setState(() => _saving = false);

    if (response.success) {
      widget.onCreated();
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('İzin talebi oluşturuldu'),
          backgroundColor: AppColors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error?.message ?? 'İzin talebi oluşturulamadı'),
          backgroundColor: AppColors.red,
        ),
      );
    }
  }

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return Dialog(
      backgroundColor: c.cardBg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
        side: BorderSide(color: c.cardBorder),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Yeni İzin Talebi', style: AppTextStyles.heading3(c)),
              AppSpacing.verticalXxl,

              // Staff dropdown
              Text('Personel', style: AppTextStyles.caption(c)),
              const SizedBox(height: 6),
              _loadingStaff
                  ? const SizedBox(
                      height: 48,
                      child: Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.primary),
                        ),
                      ),
                    )
                  : Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: c.inputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: c.inputBorder),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: _selectedStaffId,
                          hint: Text('Personel seçin',
                              style: TextStyle(color: c.textDim, fontSize: 14)),
                          dropdownColor: c.cardBg,
                          style: AppTextStyles.body(c),
                          isExpanded: true,
                          items: _staffList
                              .map((s) => DropdownMenuItem(
                                    value: s.id,
                                    child: Text(s.fullName),
                                  ))
                              .toList(),
                          onChanged: (v) =>
                              setState(() => _selectedStaffId = v),
                        ),
                      ),
                    ),
              AppSpacing.verticalLg,

              // Leave type dropdown
              Text('İzin Türü', style: AppTextStyles.caption(c)),
              const SizedBox(height: 6),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: c.inputBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: c.inputBorder),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedLeaveType,
                    dropdownColor: c.cardBg,
                    style: AppTextStyles.body(c),
                    isExpanded: true,
                    items: _leaveTypes
                        .map((t) => DropdownMenuItem(
                              value: t,
                              child: Text(t),
                            ))
                        .toList(),
                    onChanged: (v) =>
                        setState(() => _selectedLeaveType = v ?? 'Yıllık'),
                  ),
                ),
              ),
              AppSpacing.verticalLg,

              // Dates
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Başlangıç Tarihi',
                            style: AppTextStyles.caption(c)),
                        const SizedBox(height: 6),
                        _DatePickerField(
                          c: c,
                          value: _startDate,
                          hint: 'Tarih seçin',
                          onTap: () => _pickDate(isStart: true),
                          formatDate: _formatDate,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Bitiş Tarihi', style: AppTextStyles.caption(c)),
                        const SizedBox(height: 6),
                        _DatePickerField(
                          c: c,
                          value: _endDate,
                          hint: 'Tarih seçin',
                          onTap: () => _pickDate(isStart: false),
                          formatDate: _formatDate,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              AppSpacing.verticalLg,

              // Reason
              AppTextField(
                controller: _reasonController,
                label: 'Neden (Opsiyonel)',
                hintText: 'İzin nedeni...',
              ),
              AppSpacing.verticalXxl,

              // Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed:
                        _saving ? null : () => Navigator.pop(context),
                    child: Text('İptal',
                        style: AppTextStyles.body(c)
                            .copyWith(color: c.textMuted)),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 140,
                    child: AppButton(
                      text: 'Oluştur',
                      icon: Icons.add,
                      fullWidth: true,
                      height: 42,
                      isLoading: _saving,
                      onPressed: _saving ? null : _submit,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Date picker field ──
class _DatePickerField extends StatelessWidget {
  final AppColors c;
  final DateTime? value;
  final String hint;
  final VoidCallback onTap;
  final String Function(DateTime) formatDate;

  const _DatePickerField({
    required this.c,
    required this.value,
    required this.hint,
    required this.onTap,
    required this.formatDate,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: c.inputBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: c.inputBorder),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                value != null ? formatDate(value!) : hint,
                style: value != null
                    ? AppTextStyles.body(c)
                    : TextStyle(color: c.textDim, fontSize: 14),
              ),
            ),
            Icon(Icons.calendar_today, size: 16, color: c.textDim),
          ],
        ),
      ),
    );
  }
}

// ── Staff dropdown item ──
class _StaffDropdownItem {
  final int id;
  final String fullName;
  _StaffDropdownItem({required this.id, required this.fullName});
}

// ── Leave Balance Row ──
class _LeaveBalanceRow extends StatelessWidget {
  final List<StaffLeaveBalance> balances;
  const _LeaveBalanceRow({required this.balances});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return SizedBox(
      height: 110,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: balances.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final b = balances[index];
          final remainingColor = b.remainingDays > 0 ? AppColors.green : AppColors.red;
          return Container(
            width: 200,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: c.cardBg,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              border: Border.all(color: c.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(b.staffFullName,
                    style: AppTextStyles.tableCellBold(c),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _balancePill('Hak: ${b.annualEntitlement}', const Color(0xFF3b82f6), c),
                    const SizedBox(width: 6),
                    _balancePill('Kull: ${b.usedDays}', AppColors.orange, c),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _balancePill('Bekl: ${b.pendingDays}', AppColors.orange, c),
                    const SizedBox(width: 6),
                    _balancePill('Kalan: ${b.remainingDays}', remainingColor, c),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _balancePill(String text, Color color, AppColors c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(text,
          style: TextStyle(
              color: color, fontSize: 10, fontWeight: FontWeight.w600)),
    );
  }
}
