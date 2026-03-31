import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/responsive_builder.dart';
import '../widgets/sidebar.dart';
import '../widgets/topbar.dart';

class DashboardShell extends StatefulWidget {
  final Widget child;
  const DashboardShell({super.key, required this.child});

  @override
  State<DashboardShell> createState() => _DashboardShellState();
}

class _DashboardShellState extends State<DashboardShell> {

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final isMobile = ResponsiveBuilder.isMobile(context);

    return Scaffold(
      backgroundColor: c.panelBg,
      drawer: isMobile
          ? Drawer(
              backgroundColor: Colors.transparent,
              child: AppSidebar(onItemTap: () => Navigator.pop(context)),
            )
          : null,
      body: Row(
        children: [
          // Desktop sidebar
          if (!isMobile) AppSidebar(onItemTap: () {}),

          // Main content
          Expanded(
            child: Column(
              children: [
                AppTopbar(onMenuTap: () {
                  if (isMobile) {
                    Scaffold.of(context).openDrawer();
                  }
                }),
                Expanded(child: widget.child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
