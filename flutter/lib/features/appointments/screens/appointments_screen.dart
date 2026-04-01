import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/models/appointment_models.dart';
import '../../../core/widgets/app_loading.dart';
import '../../../core/widgets/app_status_badge.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/responsive_builder.dart';
import '../bloc/appointments_cubit.dart';
import '../bloc/appointments_state.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    final cubit = context.read<AppointmentsCubit>();
    cubit.load();
    cubit.loadFilterOptions();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      context.read<AppointmentsCubit>().setCustomerSearch(value);
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return SingleChildScrollView(
      padding: AppSpacing.paddingXxl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header: Title + New Appointment button ──
          _Header(c: c),
          AppSpacing.verticalLg,

          // ── Status summary cards ──
          BlocSelector<AppointmentsCubit, AppointmentsState, StatusCounts>(
            selector: (state) => state.statusCounts,
            builder: (context, counts) => _StatusCards(counts: counts, c: c),
          ),
          AppSpacing.verticalLg,

          // ── Filter toolbar ──
          BlocBuilder<AppointmentsCubit, AppointmentsState>(
            buildWhen: (prev, curr) =>
                prev.selectedDate != curr.selectedDate ||
                prev.staffFilter != curr.staffFilter ||
                prev.treatmentFilter != curr.treatmentFilter ||
                prev.statusFilter != curr.statusFilter ||
                prev.staffOptions != curr.staffOptions ||
                prev.treatmentOptions != curr.treatmentOptions,
            builder: (context, state) => _FilterToolbar(
              state: state,
              c: c,
              searchController: _searchController,
              onSearchChanged: _onSearchChanged,
            ),
          ),
          AppSpacing.verticalLg,

          // ── Date label with "Bugun" badge ──
          BlocSelector<AppointmentsCubit, AppointmentsState, DateTime>(
            selector: (state) => state.selectedDate,
            builder: (context, date) => _DateLabel(date: date, c: c),
          ),
          AppSpacing.verticalMd,

          // ── Appointment list ──
          BlocBuilder<AppointmentsCubit, AppointmentsState>(
            buildWhen: (prev, curr) =>
                prev.status != curr.status ||
                prev.appointments != curr.appointments,
            builder: (context, state) {
              if (state.status == AppointmentsStatus.loading ||
                  state.status == AppointmentsStatus.initial) {
                return const SizedBox(
                  height: 200,
                  child: AppLoading(),
                );
              }
              if (state.status == AppointmentsStatus.error) {
                return _ErrorCard(
                  message: state.error ?? 'Bir hata olustu',
                  c: c,
                  onRetry: () => context.read<AppointmentsCubit>().load(),
                );
              }
              if (state.appointments.isEmpty) {
                return _EmptyCard(c: c);
              }
              return _AppointmentList(
                appointments: state.appointments,
                c: c,
              );
            },
          ),
          AppSpacing.verticalLg,

          // ── Pagination ──
          BlocBuilder<AppointmentsCubit, AppointmentsState>(
            buildWhen: (prev, curr) =>
                prev.page != curr.page ||
                prev.totalPages != curr.totalPages ||
                prev.totalCount != curr.totalCount ||
                prev.pageSize != curr.pageSize ||
                prev.appointments.length != curr.appointments.length,
            builder: (context, state) {
              if (state.totalCount == 0) return const SizedBox.shrink();
              return _PaginationBar(state: state, c: c);
            },
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Header
// ══════════════════════════════════════════════════════════════════════════════

class _Header extends StatelessWidget {
  final AppColors c;
  const _Header({required this.c});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Randevular', style: AppTextStyles.heading2(c)),
              AppSpacing.verticalXs,
              BlocSelector<AppointmentsCubit, AppointmentsState, int>(
                selector: (state) => state.totalCount,
                builder: (context, total) => Text(
                  '$total toplam',
                  style: AppTextStyles.bodyMuted(c),
                ),
              ),
            ],
          ),
        ),
        AppButtonSmall(
          text: 'Yeni Randevu',
          icon: Icons.add,
          onPressed: () {
            // TODO: Navigate to new appointment
          },
        ),
      ],
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Status summary cards
// ══════════════════════════════════════════════════════════════════════════════

class _StatusCards extends StatelessWidget {
  final StatusCounts counts;
  final AppColors c;
  const _StatusCards({required this.counts, required this.c});

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveBuilder.isMobile(context);
    final cards = [
      _StatusCardData('Planlandi', counts.scheduled, const Color(0xFF3b82f6)),
      _StatusCardData('Onaylandi', counts.confirmed, AppColors.green),
      _StatusCardData('Tamamlandi', counts.completed, AppColors.cyan),
      _StatusCardData('Iptal', counts.cancelled, AppColors.red),
    ];

    if (isMobile) {
      return Column(
        children: [
          Row(
            children: [
              Expanded(child: _StatusCard(data: cards[0], c: c)),
              const SizedBox(width: 12),
              Expanded(child: _StatusCard(data: cards[1], c: c)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _StatusCard(data: cards[2], c: c)),
              const SizedBox(width: 12),
              Expanded(child: _StatusCard(data: cards[3], c: c)),
            ],
          ),
        ],
      );
    }

    return Row(
      children: cards.asMap().entries.map((entry) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(left: entry.key > 0 ? 12 : 0),
            child: _StatusCard(data: entry.value, c: c),
          ),
        );
      }).toList(),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final _StatusCardData data;
  final AppColors c;
  const _StatusCard({required this.data, required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: c.cardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: data.color,
              shape: BoxShape.circle,
            ),
          ),
          AppSpacing.horizontalSm,
          Expanded(
            child: Text(
              data.label,
              style: AppTextStyles.bodySmall(c),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            '${data.count}',
            style: AppTextStyles.bodyLarge(c),
          ),
        ],
      ),
    );
  }
}

class _StatusCardData {
  final String label;
  final int count;
  final Color color;
  _StatusCardData(this.label, this.count, this.color);
}

// ══════════════════════════════════════════════════════════════════════════════
// Filter toolbar
// ══════════════════════════════════════════════════════════════════════════════

class _FilterToolbar extends StatelessWidget {
  final AppointmentsState state;
  final AppColors c;
  final TextEditingController searchController;
  final ValueChanged<String> onSearchChanged;

  const _FilterToolbar({
    required this.state,
    required this.c,
    required this.searchController,
    required this.onSearchChanged,
  });

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<AppointmentsCubit>();

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: c.cardBorder),
      ),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          // "Bugun" button
          _FilterChipButton(
            label: 'Bugun',
            onTap: cubit.goToToday,
            c: c,
          ),

          // Left arrow
          _IconBtn(
            icon: Icons.chevron_left,
            onTap: cubit.goToPreviousDay,
            c: c,
          ),

          // Right arrow
          _IconBtn(
            icon: Icons.chevron_right,
            onTap: cubit.goToNextDay,
            c: c,
          ),

          // Date picker
          _DatePickerChip(
            selectedDate: state.selectedDate,
            c: c,
            onDatePicked: cubit.setDate,
          ),

          // View toggle (Liste only for now)
          _FilterChipButton(
            label: 'Liste',
            isActive: true,
            onTap: () {},
            c: c,
          ),

          // Staff filter dropdown
          _FilterDropdown<int?>(
            hint: 'Personel',
            value: state.staffFilter,
            items: [
              const DropdownMenuItem(value: null, child: Text('Tum Personel')),
              ...state.staffOptions.map((s) => DropdownMenuItem(
                    value: s.id,
                    child: Text(s.name),
                  )),
            ],
            onChanged: (v) => cubit.setStaffFilter(v),
            c: c,
          ),

          // Treatment filter dropdown
          _FilterDropdown<int?>(
            hint: 'Hizmet',
            value: state.treatmentFilter,
            items: [
              const DropdownMenuItem(value: null, child: Text('Tum Hizmetler')),
              ...state.treatmentOptions.map((t) => DropdownMenuItem(
                    value: t.id,
                    child: Text(t.name),
                  )),
            ],
            onChanged: (v) => cubit.setTreatmentFilter(v),
            c: c,
          ),

          // Status filter dropdown
          _FilterDropdown<String?>(
            hint: 'Durum',
            value: state.statusFilter,
            items: const [
              DropdownMenuItem(value: null, child: Text('Tum Durumlar')),
              DropdownMenuItem(value: 'Scheduled', child: Text('Planlandi')),
              DropdownMenuItem(value: 'Confirmed', child: Text('Onaylandi')),
              DropdownMenuItem(value: 'Completed', child: Text('Tamamlandi')),
              DropdownMenuItem(value: 'Cancelled', child: Text('Iptal')),
              DropdownMenuItem(value: 'NoShow', child: Text('Gelmedi')),
            ],
            onChanged: (v) => cubit.setStatusFilter(v),
            c: c,
          ),

          // Customer search
          SizedBox(
            width: 200,
            height: 36,
            child: TextField(
              controller: searchController,
              onChanged: onSearchChanged,
              style: AppTextStyles.body(c),
              decoration: InputDecoration(
                hintText: 'Musteri ara...',
                hintStyle: AppTextStyles.bodySmall(c),
                prefixIcon: Icon(Icons.search, size: 18, color: c.textDim),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                filled: true,
                fillColor: c.inputBg,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  borderSide: BorderSide(color: c.inputBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  borderSide: BorderSide(color: c.inputBorder),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  borderSide:
                      const BorderSide(color: AppColors.primary, width: 1.5),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChipButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final AppColors c;

  const _FilterChipButton({
    required this.label,
    this.isActive = false,
    required this.onTap,
    required this.c,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isActive ? AppColors.primary.withValues(alpha: 0.15) : c.inputBg,
      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            border: Border.all(
              color: isActive ? AppColors.primary : c.inputBorder,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isActive ? AppColors.primary : c.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final AppColors c;
  const _IconBtn({required this.icon, required this.onTap, required this.c});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: c.inputBg,
      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            border: Border.all(color: c.inputBorder),
          ),
          child: Icon(icon, size: 18, color: c.textNav),
        ),
      ),
    );
  }
}

class _DatePickerChip extends StatelessWidget {
  final DateTime selectedDate;
  final AppColors c;
  final ValueChanged<DateTime> onDatePicked;

  const _DatePickerChip({
    required this.selectedDate,
    required this.c,
    required this.onDatePicked,
  });

  @override
  Widget build(BuildContext context) {
    final formatted = DateFormat('dd.MM.yyyy', 'tr_TR').format(selectedDate);

    return Material(
      color: c.inputBg,
      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: selectedDate,
            firstDate: DateTime(2020),
            lastDate: DateTime(2030),
          );
          if (picked != null) onDatePicked(picked);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            border: Border.all(color: c.inputBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.calendar_today, size: 14, color: c.textNav),
              AppSpacing.horizontalSm,
              Text(
                formatted,
                style: TextStyle(fontSize: 13, color: c.textPrimary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterDropdown<T> extends StatelessWidget {
  final String hint;
  final T value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final AppColors c;

  const _FilterDropdown({
    required this.hint,
    required this.value,
    required this.items,
    required this.onChanged,
    required this.c,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: c.inputBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: c.inputBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          hint: Text(hint, style: TextStyle(fontSize: 13, color: c.textDim)),
          icon: Icon(Icons.keyboard_arrow_down, size: 18, color: c.textDim),
          style: TextStyle(fontSize: 13, color: c.textPrimary),
          dropdownColor: c.cardBg,
          isDense: true,
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Date label
// ══════════════════════════════════════════════════════════════════════════════

class _DateLabel extends StatelessWidget {
  final DateTime date;
  final AppColors c;
  const _DateLabel({required this.date, required this.c});

  bool get _isToday {
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }

  @override
  Widget build(BuildContext context) {
    final formatted = DateFormat('d MMMM yyyy', 'tr_TR').format(date);

    return Row(
      children: [
        Text(formatted, style: AppTextStyles.bodyLarge(c)),
        if (_isToday) ...[
          AppSpacing.horizontalSm,
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
            ),
            child: const Text(
              'Bugun',
              style: TextStyle(
                color: AppColors.primary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Appointment list
// ══════════════════════════════════════════════════════════════════════════════

class _AppointmentList extends StatelessWidget {
  final List<AppointmentListItem> appointments;
  final AppColors c;
  const _AppointmentList({required this.appointments, required this.c});

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
        child: Column(
          children: appointments.asMap().entries.map((entry) {
            final isLast = entry.key == appointments.length - 1;
            return Column(
              children: [
                _AppointmentRow(
                  appointment: entry.value,
                  c: c,
                ),
                if (!isLast) Divider(height: 1, color: c.cardBorder),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _AppointmentRow extends StatelessWidget {
  final AppointmentListItem appointment;
  final AppColors c;
  const _AppointmentRow({required this.appointment, required this.c});

  String _parseTime(String isoString) {
    if (isoString.contains('T')) {
      return isoString.split('T')[1].substring(0, 5);
    }
    return isoString;
  }

  Color _parseTreatmentColor() {
    final colorStr = appointment.treatmentColor;
    if (colorStr == null || colorStr.isEmpty) return AppColors.accent;
    try {
      final hex = colorStr.replaceFirst('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return AppColors.accent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final startTime = _parseTime(appointment.startTime);
    final endTime = _parseTime(appointment.endTime);
    final treatmentColor = _parseTreatmentColor();
    final statusColor = AppStatusBadge.statusColor(appointment.status);
    final statusLabel = AppStatusBadge.statusLabel(appointment.status);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          // Time column
          SizedBox(
            width: 60,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  startTime,
                  style: TextStyle(
                    color: c.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  endTime,
                  style: TextStyle(
                    color: c.textDim,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),

          // Color bar
          Container(
            width: 4,
            height: 40,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: treatmentColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Customer + treatment + staff
          Expanded(
            child: Row(
              children: [
                // Customer name
                Expanded(
                  flex: 2,
                  child: Text(
                    appointment.customerFullName,
                    style: AppTextStyles.tableCellBold(c),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),

                // Treatment badge
                Expanded(
                  flex: 2,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: treatmentColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      AppSpacing.horizontalSm,
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: treatmentColor.withValues(alpha: 0.12),
                            borderRadius:
                                BorderRadius.circular(AppSpacing.radiusSm),
                          ),
                          child: Text(
                            appointment.treatmentName,
                            style: TextStyle(
                              color: treatmentColor,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Staff name
                Expanded(
                  flex: 2,
                  child: Text(
                    appointment.staffFullName,
                    style: AppTextStyles.bodySmall(c),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          // Status badge
          SizedBox(
            width: 110,
            child: Align(
              alignment: Alignment.centerRight,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      statusLabel,
                      style: AppTextStyles.badge(color: statusColor),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Empty / Error cards
// ══════════════════════════════════════════════════════════════════════════════

class _EmptyCard extends StatelessWidget {
  final AppColors c;
  const _EmptyCard({required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 60),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        children: [
          Icon(Icons.calendar_today, color: c.textDim, size: 40),
          AppSpacing.verticalMd,
          Text('Randevu bulunamadi', style: AppTextStyles.bodySmall(c)),
        ],
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  final String message;
  final AppColors c;
  final VoidCallback onRetry;
  const _ErrorCard({
    required this.message,
    required this.c,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.error_outline, color: AppColors.red, size: 40),
          AppSpacing.verticalMd,
          Text(message, style: AppTextStyles.bodySmall(c)),
          AppSpacing.verticalMd,
          TextButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Tekrar Dene'),
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Pagination bar
// ══════════════════════════════════════════════════════════════════════════════

class _PaginationBar extends StatelessWidget {
  final AppointmentsState state;
  final AppColors c;
  const _PaginationBar({required this.state, required this.c});

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<AppointmentsCubit>();
    final hasPrev = state.page > 1;
    final hasNext = state.page < state.totalPages;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: c.cardBorder),
      ),
      child: Row(
        children: [
          // Range text
          Text(state.paginationRangeText, style: AppTextStyles.bodySmall(c)),

          const Spacer(),

          // Page size dropdown
          Container(
            height: 32,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: c.inputBg,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              border: Border.all(color: c.inputBorder),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int>(
                value: state.pageSize,
                icon: Icon(Icons.keyboard_arrow_down,
                    size: 16, color: c.textDim),
                style: TextStyle(fontSize: 13, color: c.textPrimary),
                dropdownColor: c.cardBg,
                isDense: true,
                items: const [
                  DropdownMenuItem(value: 10, child: Text('10')),
                  DropdownMenuItem(value: 20, child: Text('20')),
                  DropdownMenuItem(value: 50, child: Text('50')),
                ],
                onChanged: (v) {
                  if (v != null) cubit.setPageSize(v);
                },
              ),
            ),
          ),

          AppSpacing.horizontalMd,

          // Prev / Next buttons
          _PaginationButton(
            icon: Icons.chevron_left,
            enabled: hasPrev,
            onTap: () => cubit.setPage(state.page - 1),
            c: c,
          ),
          AppSpacing.horizontalXs,
          Text(
            '${state.page} / ${state.totalPages}',
            style: AppTextStyles.bodySmall(c),
          ),
          AppSpacing.horizontalXs,
          _PaginationButton(
            icon: Icons.chevron_right,
            enabled: hasNext,
            onTap: () => cubit.setPage(state.page + 1),
            c: c,
          ),
        ],
      ),
    );
  }
}

class _PaginationButton extends StatelessWidget {
  final IconData icon;
  final bool enabled;
  final VoidCallback onTap;
  final AppColors c;

  const _PaginationButton({
    required this.icon,
    required this.enabled,
    required this.onTap,
    required this.c,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: enabled ? c.inputBg : c.inputBg.withValues(alpha: 0.5),
      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        onTap: enabled ? onTap : null,
        child: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            border: Border.all(color: c.inputBorder),
          ),
          child: Icon(
            icon,
            size: 18,
            color: enabled ? c.textNav : c.textDim,
          ),
        ),
      ),
    );
  }
}
