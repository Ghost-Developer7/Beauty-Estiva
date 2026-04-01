import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/staff_models.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_loading.dart';

class StaffInviteScreen extends StatefulWidget {
  const StaffInviteScreen({super.key});

  @override
  State<StaffInviteScreen> createState() => _StaffInviteScreenState();
}

class _StaffInviteScreenState extends State<StaffInviteScreen> {
  final _emailController = TextEditingController();
  final _api = ApiService();

  bool _isLoading = false;
  InviteResult? _result;
  String? _errorMessage;

  bool _limitReached = false;
  int _currentCount = 0;
  int _maxCount = 0;

  @override
  void initState() {
    super.initState();
    _checkStaffLimit();
  }

  Future<void> _checkStaffLimit() async {
    final res = await _api.get<Map<String, dynamic>>(
      ApiEndpoints.checkStaffLimit,
      fromData: (d) => d is Map<String, dynamic> ? d : <String, dynamic>{},
    );
    if (!mounted) return;
    if (res.success && res.data != null) {
      setState(() {
        _limitReached = res.data!['limitReached'] == true;
        _currentCount = res.data!['currentCount'] ?? 0;
        _maxCount = res.data!['maxCount'] ?? 0;
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _sendInvite({bool sendEmail = true}) async {
    setState(() {
      _isLoading = true;
      _result = null;
      _errorMessage = null;
    });

    final email = _emailController.text.trim();
    final body = <String, dynamic>{};
    if (sendEmail && email.isNotEmpty) {
      body['email'] = email;
    }

    final res = await _api.post(
      ApiEndpoints.inviteToken,
      data: body,
      fromData: (d) => InviteResult.fromJson(d is Map<String, dynamic> ? d : {}),
    );

    if (res.success && res.data != null) {
      setState(() {
        _result = res.data;
        _isLoading = false;
      });
    } else {
      setState(() {
        _errorMessage = res.error?.message ?? 'Davet olusturulamadi';
        _isLoading = false;
      });
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$label kopyalandi'),
          duration: const Duration(seconds: 2),
          backgroundColor: AppColors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return SingleChildScrollView(
      padding: AppSpacing.paddingXxl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          Text('Personel Davet Et', style: AppTextStyles.heading2(c)),
          const SizedBox(height: 4),
          Text(
            'Yeni personel eklemek icin davet kodu olusturun veya e-posta gonderin',
            style: AppTextStyles.bodyMuted(c),
          ),
          AppSpacing.verticalXxl,

          // ── Staff Limit Warning ──
          if (_limitReached) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.orange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                border: Border.all(color: AppColors.orange.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppColors.orange, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Personel: $_currentCount / $_maxCount (Limit doldu)\n'
                      'Personel limitine ulaşıldı. Daha fazla personel eklemek için planınızı yükseltin.',
                      style: AppTextStyles.body(c).copyWith(color: AppColors.orange),
                    ),
                  ),
                ],
              ),
            ),
            AppSpacing.verticalLg,
          ],

          // ── Invite Form Card ──
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: c.cardBg,
              borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
              border: Border.all(color: c.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Davet Bilgileri', style: AppTextStyles.heading3(c)),
                AppSpacing.verticalLg,

                // Email input
                AppTextField(
                  controller: _emailController,
                  label: 'E-posta Adresi (istege bagli)',
                  hintText: 'ornek@email.com',
                  keyboardType: TextInputType.emailAddress,
                ),
                AppSpacing.verticalXxl,

                // Error message
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                      border: Border.all(color: AppColors.red.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.red, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: AppTextStyles.body(c).copyWith(color: AppColors.red),
                          ),
                        ),
                      ],
                    ),
                  ),
                  AppSpacing.verticalLg,
                ],

                // Buttons
                if (_isLoading)
                  const Center(child: AppLoading())
                else
                  Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          text: 'Davet Gonder',
                          icon: Icons.send,
                          onPressed: () => _sendInvite(sendEmail: true),
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _OutlinedButton(
                          text: 'Sadece Kod Olustur',
                          icon: Icons.vpn_key_outlined,
                          onPressed: () => _sendInvite(sendEmail: false),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          AppSpacing.verticalXxl,

          // ── Result Section ──
          if (_result != null) ...[
            _InviteResultCard(
              result: _result!,
              onCopyToken: () => _copyToClipboard(_result!.token, 'Davet kodu'),
              onCopyUrl: () => _copyToClipboard(_result!.registerUrl, 'Kayit linki'),
            ),
            AppSpacing.verticalXxl,
          ],

          // ── How It Works ──
          _HowItWorksCard(),
        ],
      ),
    );
  }
}

// ── Outlined Button ──
class _OutlinedButton extends StatelessWidget {
  final String text;
  final IconData? icon;
  final VoidCallback? onPressed;

  const _OutlinedButton({
    required this.text,
    this.icon,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return SizedBox(
      height: 48,
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: AppColors.primary.withValues(alpha: 0.5)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[
              Icon(icon, color: AppColors.primary, size: 16),
              AppSpacing.horizontalSm,
            ],
            Text(
              text,
              style: AppTextStyles.body(c).copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Invite Result Card ──
class _InviteResultCard extends StatelessWidget {
  final InviteResult result;
  final VoidCallback onCopyToken;
  final VoidCallback onCopyUrl;

  const _InviteResultCard({
    required this.result,
    required this.onCopyToken,
    required this.onCopyUrl,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.green.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.green.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: const Icon(Icons.check_circle_outline, color: AppColors.green, size: 20),
              ),
              const SizedBox(width: 12),
              Text('Davet Olusturuldu', style: AppTextStyles.heading3(c)),
            ],
          ),
          AppSpacing.verticalXxl,

          // Davet Kodu
          _ResultField(
            label: 'Davet Kodu',
            value: result.token,
            onCopy: onCopyToken,
          ),
          AppSpacing.verticalLg,

          // Kayit Linki
          _ResultField(
            label: 'Kayit Linki',
            value: result.registerUrl,
            onCopy: onCopyUrl,
          ),
          AppSpacing.verticalLg,

          // E-posta durumu
          Row(
            children: [
              Text('E-posta durumu: ', style: AppTextStyles.bodyMuted(c)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: result.emailSent
                      ? AppColors.green.withValues(alpha: 0.15)
                      : AppColors.orange.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  result.emailSent ? 'Gonderildi' : 'Gonderilmedi',
                  style: TextStyle(
                    color: result.emailSent ? AppColors.green : AppColors.orange,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          AppSpacing.verticalMd,

          // Gecerlilik
          Row(
            children: [
              Icon(Icons.schedule, color: c.textDim, size: 16),
              const SizedBox(width: 6),
              Text('Gecerlilik: 24 saat', style: AppTextStyles.bodySmall(c)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Result Field (label + value + copy) ──
class _ResultField extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onCopy;

  const _ResultField({
    required this.label,
    required this.value,
    required this.onCopy,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption(c)),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: c.inputBg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: c.inputBorder),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  value,
                  style: AppTextStyles.body(c),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: onCopy,
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(Icons.copy, color: AppColors.primary, size: 18),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── How It Works Card ──
class _HowItWorksCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final steps = [
      _StepData(
        number: '1',
        title: 'Davet Olusturun',
        description: 'E-posta adresi girerek veya sadece kod olusturarak bir davet hazirlayın.',
        color: AppColors.primary,
      ),
      _StepData(
        number: '2',
        title: 'Kodu Paylasin',
        description: 'Olusturulan davet kodunu veya kayit linkini personelle paylasin.',
        color: AppColors.accent,
      ),
      _StepData(
        number: '3',
        title: 'Personel Kayit Olsun',
        description: 'Personel, davet kodu veya link ile sisteme kayit olur.',
        color: AppColors.green,
      ),
      _StepData(
        number: '4',
        title: 'Onaylayin',
        description: 'Kayit olan personeli onaylayin ve roller atayin.',
        color: AppColors.orange,
      ),
    ];

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.help_outline, color: c.textDim, size: 20),
              const SizedBox(width: 8),
              Text('Nasil Calisir?', style: AppTextStyles.heading3(c)),
            ],
          ),
          AppSpacing.verticalXxl,
          ...steps.map((step) => Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: step.color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                      ),
                      child: Center(
                        child: Text(
                          step.number,
                          style: TextStyle(
                            color: step.color,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(step.title, style: AppTextStyles.bodyLarge(c)),
                          const SizedBox(height: 4),
                          Text(step.description, style: AppTextStyles.bodyMuted(c)),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

class _StepData {
  final String number;
  final String title;
  final String description;
  final Color color;

  const _StepData({
    required this.number,
    required this.title,
    required this.description,
    required this.color,
  });
}
