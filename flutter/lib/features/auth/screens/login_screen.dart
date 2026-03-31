import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/responsive_builder.dart';

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
    final auth = context.read<AuthProvider>();
    final success = await auth.login(
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

          // Content
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
        // Left: Hero
        Expanded(child: _buildHeroSection(c)),
        // Right: Form
        SizedBox(width: 460, child: Center(child: _buildFormCard(c))),
      ],
    );
  }

  Widget _buildMobileLayout(AppColors c) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
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
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: c.cardBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8, height: 8,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppColors.primaryGradient,
                  ),
                ),
                const SizedBox(width: 10),
                Text('TEKRAR HOŞ GELDİNİZ',
                    style: TextStyle(color: c.textMuted, fontSize: 11,
                        fontWeight: FontWeight.w600, letterSpacing: 3)),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Title
          Text('Salonunuz sizi\nbekliyor.',
              style: TextStyle(color: c.textPrimary, fontSize: 42,
                  fontWeight: FontWeight.bold, height: 1.15)),
          const SizedBox(height: 12),
          Text(
            'Kaldığınız yerden devam edin — randevular, analizler ve tüm ekibiniz tek bir zarif konsolda.',
            style: TextStyle(color: c.textDim, fontSize: 15, height: 1.6),
          ),
          const SizedBox(height: 32),

          // Highlights
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
                    Text(text, style: TextStyle(color: c.textDim, fontSize: 13)),
                  ],
                ),
              )),
          const SizedBox(height: 36),

          // Stats
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: c.cardBg,
              borderRadius: BorderRadius.circular(16),
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
            child: Text(value, style: const TextStyle(
                fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white)),
          ),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(
              color: c.textDim, fontSize: 10, letterSpacing: 2)),
        ],
      ),
    );
  }

  Widget _buildFormCard(AppColors c) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.all(40),
          decoration: BoxDecoration(
            color: c.loginCardBg,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: c.cardBorder),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('ÜYE GİRİŞİ', style: TextStyle(
                  color: c.textDim, fontSize: 11,
                  fontWeight: FontWeight.w600, letterSpacing: 3)),
              const SizedBox(height: 8),
              Text('Giriş yap', style: TextStyle(
                  color: c.textPrimary, fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text('Yönetim paneline erişmek için bilgilerinizi girin.',
                  style: TextStyle(color: c.textDim, fontSize: 13)),
              const SizedBox(height: 32),

              // Email
              _buildLabel('E-posta', c),
              const SizedBox(height: 6),
              TextField(
                controller: _emailController,
                style: TextStyle(color: c.textPrimary, fontSize: 14),
                decoration: const InputDecoration(hintText: 'sen@example.com'),
                keyboardType: TextInputType.emailAddress,
                onSubmitted: (_) => _handleLogin(),
              ),
              const SizedBox(height: 16),

              // Password
              _buildLabel('Şifre', c),
              const SizedBox(height: 6),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                style: TextStyle(color: c.textPrimary, fontSize: 14),
                decoration: InputDecoration(
                  hintText: '********',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      color: c.textDim,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                onSubmitted: (_) => _handleLogin(),
              ),
              const SizedBox(height: 8),

              // Error
              if (auth.error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 8),
                  child: Text(auth.error!,
                      style: const TextStyle(color: AppColors.red, fontSize: 13)),
                ),

              const SizedBox(height: 16),

              // Login button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: ElevatedButton(
                    onPressed: auth.isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                    child: auth.isLoading
                        ? const SizedBox(width: 22, height: 22,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Text('Giris',
                            style: TextStyle(color: Colors.white, fontSize: 15,
                                fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Signup link
              RichText(
                text: TextSpan(
                  style: const TextStyle(fontSize: 12),
                  children: [
                    TextSpan(text: 'Henuz hesabiniz yok mu?',
                        style: TextStyle(color: c.textDim)),
                    const TextSpan(text: 'Hemen olusturun',
                        style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLabel(String text, AppColors c) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(text, style: TextStyle(
          color: c.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
