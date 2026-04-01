import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/bloc/auth/auth_cubit.dart';
import '../../../core/bloc/auth/auth_state.dart';
import '../../../core/bloc/theme/theme_cubit.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/models/auth_models.dart';
import '../../../core/widgets/responsive_builder.dart';
import '../../../core/widgets/app_icon_button.dart';
import '../../../core/widgets/app_avatar.dart';

class AppTopbar extends StatelessWidget {
  final VoidCallback onMenuTap;
  const AppTopbar({super.key, required this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final isMobile = ResponsiveBuilder.isMobile(context);

    return Container(
      padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 12 : 24, vertical: 12),
      decoration: BoxDecoration(
        color: c.topbarBg,
        border: Border(bottom: BorderSide(color: c.cardBorder)),
      ),
      child: Row(
        children: [
          if (isMobile) AppIconButton(icon: Icons.menu_rounded, onTap: onMenuTap),

          // Company badge - sadece user değiştiğinde rebuild
          if (!isMobile) _CompanyBadge(),

          AppSpacing.horizontalLg,

          // Search bar
          if (!isMobile) Expanded(child: _SearchBar()) else const Spacer(),

          AppSpacing.horizontalMd,

          AppIconButton(icon: Icons.notifications_none_rounded, onTap: () {}),
          AppSpacing.horizontalSm,

          if (!isMobile) ...[
            _LanguageBadge(),
            AppSpacing.horizontalSm,
            _ThemeToggle(),
            AppSpacing.horizontalMd,
          ],

          // User profile - sadece user değiştiğinde rebuild
          _UserProfile(isMobile: isMobile),

          AppSpacing.horizontalSm,
          _LogoutButton(),
        ],
      ),
    );
  }
}

class _CompanyBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return BlocSelector<AuthCubit, AuthState, bool>(
      selector: (state) => state.user != null,
      builder: (context, hasUser) {
        if (!hasUser) return const SizedBox.shrink();
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const AppAvatar(initials: 'G', size: 32, gradient: AppColors.pinkGradient, fontSize: 13, borderRadius: 8),
            AppSpacing.horizontalSm,
            Text('Glow Atelier', style: AppTextStyles.bodyLarge(c).copyWith(fontSize: 14)),
          ],
        );
      },
    );
  }
}

class _SearchBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: c.cardBorder),
      ),
      child: Row(
        children: [
          Icon(Icons.search, color: c.textDim, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              style: AppTextStyles.body(c),
              decoration: InputDecoration(
                hintText: 'Müşteri, personel, randevu ara...',
                hintStyle: AppTextStyles.bodySmall(c),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LanguageBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: c.navIconBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: c.cardBorder),
      ),
      child: Text('TR',
          style: TextStyle(
              color: c.textNav, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}

/// Theme toggle - sadece theme state değiştiğinde rebuild
class _ThemeToggle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeCubit, bool>(
      builder: (context, isDark) {
        return AppIconButton(
          icon: isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
          onTap: () => context.read<ThemeCubit>().toggleTheme(),
        );
      },
    );
  }
}

/// User profile - sadece user bilgisi değiştiğinde rebuild
class _UserProfile extends StatelessWidget {
  final bool isMobile;
  const _UserProfile({required this.isMobile});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return BlocSelector<AuthCubit, AuthState, AuthUser?>(
      selector: (state) => state.user,
      builder: (context, user) {
        if (user == null) return const SizedBox.shrink();
        return Container(
          padding: EdgeInsets.fromLTRB(4, 4, isMobile ? 4 : 16, 4),
          decoration: BoxDecoration(
            color: c.navIconBg,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: c.cardBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Profil resmi veya inisiyalli avatar
              AppAvatar.circle(
                initials: user.initials,
                imageUrl: user.profileImageUrl,
                size: 38,
                showOnlineIndicator: true,
              ),
              if (!isMobile) ...[
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      user.fullName,
                      style: TextStyle(
                        color: c.textPrimary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      user.displayRole.toUpperCase(),
                      style: TextStyle(
                        color: c.textDim,
                        fontSize: 9,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 8),
                Icon(Icons.keyboard_arrow_down, color: c.textDim, size: 18),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _LogoutButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AppIconButton(
      icon: Icons.logout_rounded,
      onTap: () async {
        await context.read<AuthCubit>().logout();
        if (context.mounted) context.go('/login');
      },
    );
  }
}
