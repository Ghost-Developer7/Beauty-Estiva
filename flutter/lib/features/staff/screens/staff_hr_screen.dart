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
import '../../../core/widgets/app_avatar.dart';

// ── Avatar gradient pairs ──
const _avatarGradients = [
  LinearGradient(colors: [Color(0xFFffd1dc), Color(0xFFf3a4ff)]),
  LinearGradient(colors: [Color(0xFFddd6fe), Color(0xFFa78bfa)]),
  LinearGradient(colors: [Color(0xFFbfdbfe), Color(0xFF60a5fa)]),
  LinearGradient(colors: [Color(0xFFa7f3d0), Color(0xFF34d399)]),
  LinearGradient(colors: [Color(0xFFfde68a), Color(0xFFfbbf24)]),
  LinearGradient(colors: [Color(0xFFa5f3fc), Color(0xFF22d3ee)]),
  LinearGradient(colors: [Color(0xFFf5d0fe), Color(0xFFe879f9)]),
  LinearGradient(colors: [Color(0xFFd9f99d), Color(0xFFa3e635)]),
];

const _currencySymbols = {
  'TRY': '₺',
  'USD': '\$',
  'EUR': '€',
  'GBP': '£',
};

String _formatCurrency(double? value, [String currency = 'TRY']) {
  if (value == null) return '-';
  final symbol = _currencySymbols[currency] ?? '₺';
  final parts = value.toStringAsFixed(0).split('');
  final buf = StringBuffer();
  for (var i = 0; i < parts.length; i++) {
    if (i > 0 && (parts.length - i) % 3 == 0) buf.write('.');
    buf.write(parts[i]);
  }
  return '$symbol$buf';
}

String _formatDate(String? date) {
  if (date == null || date.isEmpty) return '-';
  try {
    final d = DateTime.parse(date);
    return '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
  } catch (_) {
    return date;
  }
}

String _getInitials(String fullName) {
  final parts = fullName.trim().split(' ');
  if (parts.length >= 2) {
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }
  return fullName.isNotEmpty ? fullName[0].toUpperCase() : '?';
}

class StaffHrScreen extends StatefulWidget {
  const StaffHrScreen({super.key});

  @override
  State<StaffHrScreen> createState() => _StaffHrScreenState();
}

class _StaffHrScreenState extends State<StaffHrScreen> {
  final _api = ApiService();
  final _searchController = TextEditingController();
  bool _loading = true;
  String? _error;
  List<StaffHRSummary> _hrList = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadHrData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadHrData() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final response = await _api.get<List<StaffHRSummary>>(
      ApiEndpoints.staffHrSummary,
      fromData: (data) => (data as List)
          .map((e) => StaffHRSummary.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    if (!mounted) return;
    if (response.success && response.data != null) {
      setState(() {
        _hrList = response.data!;
        _loading = false;
      });
    } else {
      setState(() {
        _error = response.error?.message ?? 'Özlük verileri yüklenemedi';
        _loading = false;
      });
    }
  }

  List<StaffHRSummary> get _filteredList {
    if (_searchQuery.isEmpty) return _hrList;
    final q = _searchQuery.toLowerCase();
    return _hrList.where((hr) {
      return hr.staffFullName.toLowerCase().contains(q) ||
          (hr.position?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  void _showEditDialog(StaffHRSummary summary) {
    showDialog(
      context: context,
      builder: (ctx) => _EditHrDialog(
        summary: summary,
        onSaved: _loadHrData,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final filtered = _filteredList;

    return Padding(
      padding: AppSpacing.paddingXxl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          Text('Özlük Bilgileri', style: AppTextStyles.heading2(c)),
          const SizedBox(height: 4),
          Text(
            'Personel özlük ve maaş bilgilerini yönetin',
            style: AppTextStyles.bodyMuted(c),
          ),
          AppSpacing.verticalLg,

          // ── Search ──
          AppSearchBar(
            controller: _searchController,
            hintText: 'Personel adı veya pozisyon ile arayın...',
            onSubmitted: (v) => setState(() => _searchQuery = v),
          ),
          AppSpacing.verticalLg,

          // ── Table ──
          Expanded(
            child: _loading
                ? const AppLoading()
                : _error != null
                    ? AppErrorState(
                        message: _error!,
                        onRetry: _loadHrData,
                      )
                    : filtered.isEmpty
                        ? const AppEmptyState(
                            message: 'Personel bulunamadı',
                            icon: Icons.badge_outlined,
                          )
                        : _HrTable(
                            hrList: filtered,
                            c: c,
                            onEdit: _showEditDialog,
                          ),
          ),
        ],
      ),
    );
  }
}

// ── HR Table ──
class _HrTable extends StatelessWidget {
  final List<StaffHRSummary> hrList;
  final AppColors c;
  final ValueChanged<StaffHRSummary> onEdit;

  const _HrTable({
    required this.hrList,
    required this.c,
    required this.onEdit,
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
                DataColumn(label: Text('POZİSYON')),
                DataColumn(label: Text('İŞE GİRİŞ')),
                DataColumn(label: Text('MAAŞ'), numeric: true),
                DataColumn(label: Text('YILLIK İZİN'), numeric: true),
                DataColumn(label: Text('KULLANILAN'), numeric: true),
                DataColumn(label: Text('KALAN'), numeric: true),
                DataColumn(label: Text('İŞLEMLER')),
              ],
              rows: List.generate(hrList.length, (index) {
                final hr = hrList[index];
                final gradient =
                    _avatarGradients[index % _avatarGradients.length];

                return DataRow(
                  color: WidgetStateProperty.resolveWith((states) {
                    if (index.isOdd) return c.tableRowAlt;
                    return c.cardBg;
                  }),
                  cells: [
                    // Personel (avatar + name)
                    DataCell(_StaffCell(
                      initials: _getInitials(hr.staffFullName),
                      gradient: gradient,
                      fullName: hr.staffFullName,
                    )),
                    // Pozisyon
                    DataCell(Text(hr.position ?? '-',
                        style: AppTextStyles.tableCell(c))),
                    // İşe Giriş
                    DataCell(Text(_formatDate(hr.hireDate))),
                    // Maaş
                    DataCell(Text(
                      _formatCurrency(hr.salary, hr.salaryCurrency),
                      style: AppTextStyles.tableCellBold(c),
                    )),
                    // Yıllık İzin
                    DataCell(Text('${hr.annualLeaveEntitlement} gün')),
                    // Kullanılan
                    DataCell(Text(
                      '${hr.usedLeaveDays} gün',
                      style: AppTextStyles.tableCell(c)
                          .copyWith(color: AppColors.orange),
                    )),
                    // Kalan
                    DataCell(Text(
                      '${hr.remainingLeaveDays} gün',
                      style: AppTextStyles.tableCellBold(c).copyWith(
                        color: hr.remainingLeaveDays > 0
                            ? AppColors.green
                            : AppColors.red,
                      ),
                    )),
                    // Actions
                    DataCell(
                      IconButton(
                        icon: Icon(Icons.edit_outlined,
                            size: 18, color: c.textNav),
                        onPressed: () => onEdit(hr),
                        tooltip: 'Düzenle',
                        splashRadius: 18,
                      ),
                    ),
                  ],
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Staff cell (avatar + name) ──
class _StaffCell extends StatelessWidget {
  final String initials;
  final LinearGradient gradient;
  final String fullName;

  const _StaffCell({
    required this.initials,
    required this.gradient,
    required this.fullName,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        AppAvatar(
          initials: initials,
          gradient: gradient,
          size: 36,
          borderRadius: AppSpacing.radiusSm,
          fontSize: 13,
        ),
        const SizedBox(width: 12),
        Text(fullName, style: AppTextStyles.tableCellBold(c)),
      ],
    );
  }
}

// ── Edit HR Dialog ──
class _EditHrDialog extends StatefulWidget {
  final StaffHRSummary summary;
  final VoidCallback onSaved;

  const _EditHrDialog({
    required this.summary,
    required this.onSaved,
  });

  @override
  State<_EditHrDialog> createState() => _EditHrDialogState();
}

class _EditHrDialogState extends State<_EditHrDialog> {
  final _api = ApiService();
  bool _loading = true;
  bool _saving = false;

  // HR detail fields
  late TextEditingController _positionCtrl;
  late TextEditingController _salaryCtrl;
  late TextEditingController _identityCtrl;
  late TextEditingController _emergencyNameCtrl;
  late TextEditingController _emergencyPhoneCtrl;
  late TextEditingController _annualLeaveCtrl;
  late TextEditingController _notesCtrl;
  DateTime? _hireDate;
  String _selectedCurrency = 'TRY';

  @override
  void initState() {
    super.initState();
    _positionCtrl = TextEditingController(text: widget.summary.position ?? '');
    _salaryCtrl = TextEditingController(
        text: widget.summary.salary?.toStringAsFixed(0) ?? '');
    _selectedCurrency = widget.summary.salaryCurrency;
    _identityCtrl = TextEditingController();
    _emergencyNameCtrl = TextEditingController();
    _emergencyPhoneCtrl = TextEditingController();
    _annualLeaveCtrl = TextEditingController(
        text: '${widget.summary.annualLeaveEntitlement}');
    _notesCtrl = TextEditingController();

    if (widget.summary.hireDate != null &&
        widget.summary.hireDate!.isNotEmpty) {
      try {
        _hireDate = DateTime.parse(widget.summary.hireDate!);
      } catch (_) {}
    }

    _loadDetails();
  }

  @override
  void dispose() {
    _positionCtrl.dispose();
    _salaryCtrl.dispose();
    _identityCtrl.dispose();
    _emergencyNameCtrl.dispose();
    _emergencyPhoneCtrl.dispose();
    _annualLeaveCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadDetails() async {
    final response = await _api.get<StaffHRInfo>(
      ApiEndpoints.staffHrInfo(widget.summary.staffId),
      fromData: (data) =>
          StaffHRInfo.fromJson(data as Map<String, dynamic>),
    );
    if (!mounted) return;

    if (response.success && response.data != null) {
      final info = response.data!;
      setState(() {
        _positionCtrl.text = info.position ?? _positionCtrl.text;
        _salaryCtrl.text = info.salary?.toStringAsFixed(0) ?? _salaryCtrl.text;
        _selectedCurrency = info.salaryCurrency;
        _identityCtrl.text = info.identityNumber ?? '';
        _emergencyNameCtrl.text = info.emergencyContactName ?? '';
        _emergencyPhoneCtrl.text = info.emergencyContactPhone ?? '';
        _annualLeaveCtrl.text = '${info.annualLeaveEntitlement}';
        _notesCtrl.text = info.notes ?? '';
        if (info.hireDate != null && info.hireDate!.isNotEmpty) {
          try {
            _hireDate = DateTime.parse(info.hireDate!);
          } catch (_) {}
        }
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  Future<void> _pickHireDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _hireDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _hireDate = picked);
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);

    final body = <String, dynamic>{
      'position': _positionCtrl.text.trim().isNotEmpty
          ? _positionCtrl.text.trim()
          : null,
      'salary': _salaryCtrl.text.trim().isNotEmpty
          ? double.tryParse(_salaryCtrl.text.trim())
          : null,
      'salaryCurrency': _selectedCurrency,
      'identityNumber': _identityCtrl.text.trim().isNotEmpty
          ? _identityCtrl.text.trim()
          : null,
      'emergencyContactName': _emergencyNameCtrl.text.trim().isNotEmpty
          ? _emergencyNameCtrl.text.trim()
          : null,
      'emergencyContactPhone': _emergencyPhoneCtrl.text.trim().isNotEmpty
          ? _emergencyPhoneCtrl.text.trim()
          : null,
      'annualLeaveEntitlement':
          int.tryParse(_annualLeaveCtrl.text.trim()) ?? 14,
      'notes':
          _notesCtrl.text.trim().isNotEmpty ? _notesCtrl.text.trim() : null,
    };

    if (_hireDate != null) {
      body['hireDate'] = _hireDate!.toIso8601String().split('T').first;
    }

    final response = await _api.put(
      ApiEndpoints.staffHrInfo(widget.summary.staffId),
      data: body,
    );

    if (!mounted) return;
    setState(() => _saving = false);

    if (response.success) {
      widget.onSaved();
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Özlük bilgileri güncellendi'),
          backgroundColor: AppColors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error?.message ?? 'Güncelleme başarısız'),
          backgroundColor: AppColors.red,
        ),
      );
    }
  }

  String _formatDateDisplay(DateTime d) =>
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
        constraints: const BoxConstraints(maxWidth: 520),
        child: _loading
            ? const Padding(
                padding: EdgeInsets.all(48),
                child: AppLoading(),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          widget.summary.staffFullName,
                          style: AppTextStyles.heading3(c),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: Icon(Icons.close, color: c.textDim, size: 20),
                          onPressed: () => Navigator.pop(context),
                          splashRadius: 18,
                        ),
                      ],
                    ),
                    Text('Özlük Bilgileri Düzenle',
                        style: AppTextStyles.bodyMuted(c)),
                    AppSpacing.verticalXxl,

                    // Position
                    AppTextField(
                      controller: _positionCtrl,
                      label: 'Pozisyon',
                      hintText: 'Örn: Kuaför, Güzellik Uzmanı',
                    ),
                    AppSpacing.verticalLg,

                    // Hire date
                    Text('İşe Giriş Tarihi', style: AppTextStyles.caption(c)),
                    const SizedBox(height: 6),
                    GestureDetector(
                      onTap: _pickHireDate,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 14),
                        decoration: BoxDecoration(
                          color: c.inputBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: c.inputBorder),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                _hireDate != null
                                    ? _formatDateDisplay(_hireDate!)
                                    : 'Tarih seçin',
                                style: _hireDate != null
                                    ? AppTextStyles.body(c)
                                    : TextStyle(
                                        color: c.textDim, fontSize: 14),
                              ),
                            ),
                            Icon(Icons.calendar_today,
                                size: 16, color: c.textDim),
                          ],
                        ),
                      ),
                    ),
                    AppSpacing.verticalLg,

                    // Salary
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          flex: 3,
                          child: AppTextField(
                            controller: _salaryCtrl,
                            label: 'Maaş',
                            hintText: 'Örn: 25000',
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('Para Birimi',
                                  style: AppTextStyles.caption(c)),
                              const SizedBox(height: 6),
                              Container(
                                height: 48,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12),
                                decoration: BoxDecoration(
                                  color: c.inputBg,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: c.inputBorder),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: _selectedCurrency,
                                    isExpanded: true,
                                    dropdownColor: c.cardBg,
                                    style: AppTextStyles.body(c),
                                    items: ['TRY', 'USD', 'EUR', 'GBP']
                                        .map((code) => DropdownMenuItem(
                                              value: code,
                                              child: Text(
                                                  '${_currencySymbols[code]} $code'),
                                            ))
                                        .toList(),
                                    onChanged: (v) {
                                      if (v != null) {
                                        setState(
                                            () => _selectedCurrency = v);
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalLg,

                    // Identity
                    AppTextField(
                      controller: _identityCtrl,
                      label: 'Kimlik No',
                      hintText: 'TC Kimlik Numarası',
                      keyboardType: TextInputType.number,
                    ),
                    AppSpacing.verticalLg,

                    // Emergency contact
                    Row(
                      children: [
                        Expanded(
                          child: AppTextField(
                            controller: _emergencyNameCtrl,
                            label: 'Acil Durum Kişisi',
                            hintText: 'Ad Soyad',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: AppTextField(
                            controller: _emergencyPhoneCtrl,
                            label: 'Acil Durum Tel',
                            hintText: '05XX XXX XX XX',
                            keyboardType: TextInputType.phone,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalLg,

                    // Annual leave
                    AppTextField(
                      controller: _annualLeaveCtrl,
                      label: 'Yıllık İzin Hakkı (Gün)',
                      hintText: '14',
                      keyboardType: TextInputType.number,
                    ),
                    AppSpacing.verticalLg,

                    // Notes
                    Text('Notlar', style: AppTextStyles.caption(c)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _notesCtrl,
                      maxLines: 3,
                      style: AppTextStyles.body(c),
                      decoration: InputDecoration(
                        hintText: 'Ek notlar...',
                        hintStyle: TextStyle(color: c.textDim, fontSize: 14),
                      ),
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
                            text: 'Kaydet',
                            icon: Icons.save,
                            fullWidth: true,
                            height: 42,
                            isLoading: _saving,
                            onPressed: _saving ? null : _save,
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
