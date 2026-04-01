import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/bloc/auth/auth_cubit.dart';
import '../../../core/bloc/auth/auth_state.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/responsive_builder.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final success = await context.read<AuthCubit>().login(
          _emailController.text.trim(),
          _passwordController.text,
        );
    if (success && mounted) {
      context.go('/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final isMobile = ResponsiveBuilder.isMobile(context);

    return Scaffold(
      backgroundColor: c.loginBg,
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: c.cardBorder)),
            ),
            child: Row(
              children: [
                Text('ESTIVA',
                    style: TextStyle(
                      color: c.textPrimary,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 5,
                    )),
              ],
            ),
          ),
          Expanded(
            child: isMobile ? _buildMobileLayout(c) : _buildDesktopLayout(c),
          ),
        ],
      ),
    );
  }

  Widget _buildDesktopLayout(AppColors c) {
    return Row(
      children: [
        Expanded(child: _buildHeroSection(c)),
        SizedBox(width: 460, child: Center(child: _buildFormCard(c))),
      ],
    );
  }

  Widget _buildMobileLayout(AppColors c) {
    return SingleChildScrollView(
      padding: AppSpacing.paddingXxl,
      child: _buildFormCard(c),
    );
  }

  Widget _buildHeroSection(AppColors c) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 60, vertical: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: c.navIconBg,
              borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
              border: Border.all(color: c.cardBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppColors.primaryGradient,
                  ),
                ),
                const SizedBox(width: 10),
                Text('TEKRAR HOŞ GELDİNİZ',
                    style: AppTextStyles.labelWide(c)),
              ],
            ),
          ),
          AppSpacing.verticalXxl,
          Text('Salonunuz sizi\nbekliyor.', style: AppTextStyles.hero(c)),
          AppSpacing.verticalMd,
          Text(
            'Kaldığınız yerden devam edin — randevular, analizler ve tüm ekibiniz tek bir zarif konsolda.',
            style: TextStyle(color: c.textDim, fontSize: 15, height: 1.6),
          ),
          AppSpacing.verticalXxxl,
          ...[
            'Gerçek zamanlı pano parmaklarınızın ucunda.',
            'Kusursuz randevu yönetimi.',
            'Güçlü içgörüler, zarif sunumla.',
          ].map((text) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    const Icon(Icons.check, color: AppColors.primary, size: 18),
                    const SizedBox(width: 10),
                    Text(text, style: AppTextStyles.bodySmall(c)),
                  ],
                ),
              )),
          const SizedBox(height: 36),
          Container(
            padding: AppSpacing.paddingXxl,
            decoration: BoxDecoration(
              color: c.cardBg,
              borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
              border: Border.all(color: c.cardBorder),
            ),
            child: Row(
              children: [
                _buildStat('500+', 'SALON', c),
                _buildStat('2M+', 'RANDEVU', c),
                _buildStat('99%', 'MEMNUNIYET', c),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String value, String label, AppColors c) {
    return Expanded(
      child: Column(
        children: [
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [AppColors.primary, AppColors.accent],
            ).createShader(bounds),
            child: Text(value,
                style: AppTextStyles.statValue(c)
                    .copyWith(color: Colors.white)),
          ),
          AppSpacing.verticalXs,
          Text(label, style: AppTextStyles.labelWide(c)),
        ],
      ),
    );
  }

  Widget _buildFormCard(AppColors c) {
    return Container(
      margin: AppSpacing.paddingXxl,
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: c.loginCardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('ÜYE GİRİŞİ', style: AppTextStyles.labelWide(c)),
          AppSpacing.verticalSm,
          Text('Giriş yap', style: AppTextStyles.heading1(c)),
          AppSpacing.verticalSm,
          Text('Yönetim paneline erişmek için bilgilerinizi girin.',
              style: AppTextStyles.bodySmall(c)),
          AppSpacing.verticalXxxl,
          AppTextField(
            controller: _emailController,
            label: 'E-posta',
            hintText: 'sen@example.com',
            keyboardType: TextInputType.emailAddress,
            onSubmitted: (_) => _handleLogin(),
          ),
          AppSpacing.verticalLg,
          AppTextField(
            controller: _passwordController,
            label: 'Şifre',
            hintText: '********',
            obscureText: _obscurePassword,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
                color: c.textDim,
              ),
              onPressed: () =>
                  setState(() => _obscurePassword = !_obscurePassword),
            ),
            onSubmitted: (_) => _handleLogin(),
          ),
          AppSpacing.verticalSm,

          // Error - sadece hata değiştiğinde rebuild
          BlocSelector<AuthCubit, AuthState, String?>(
            selector: (state) => state.error,
            builder: (context, error) {
              if (error == null) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(top: 8, bottom: 8),
                child: Text(error,
                    style: const TextStyle(color: AppColors.red, fontSize: 13)),
              );
            },
          ),

          AppSpacing.verticalLg,

          // Button - sadece loading değiştiğinde rebuild
          BlocSelector<AuthCubit, AuthState, bool>(
            selector: (state) => state.isLoading,
            builder: (context, isLoading) {
              return AppButton(
                text: 'Giris',
                isLoading: isLoading,
                onPressed: isLoading ? null : _handleLogin,
              );
            },
          ),

          AppSpacing.verticalXl,
          RichText(
            text: TextSpan(
              style: const TextStyle(fontSize: 12),
              children: [
                TextSpan(
                    text: 'Henuz hesabiniz yok mu? ',
                    style: TextStyle(color: c.textDim)),
                const TextSpan(
                    text: 'Hemen olusturun',
                    style: TextStyle(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
