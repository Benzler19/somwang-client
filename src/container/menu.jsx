const accessMenu = ({ PERMISSIONS }) => {
  const menuItems = [];
  const menuprojectItems = [];

  const _checkPermission = (data) => {
    if (Array.isArray(PERMISSIONS)) {
      const permission = PERMISSIONS.find(
        (item) => item.menu_name_en === data && item.permission_view === 1
      );
      return permission !== undefined;
    }
    return false;
  };

  if (_checkPermission("home")) {
    menuItems.push({
      tag: "NavItem",
      name: "หน้าหลัก",
      icon: "pi pi-home",
      to: "/",
    });

    if (_checkPermission("site")) {
      menuItems.push({
        tag: "NavItem",
        name: "การคาดการณ์ขาย",
        icon: "pi pi-chart-line",
        to: "/project",
      });
    }

    if (_checkPermission("product")) {
      menuItems.push({
        tag: "NavItem",
        name: "รายการสินค้า",
        icon: "pi pi-box",
        to: "/product",
      });
    }

    if (_checkPermission("stock")) {
      menuItems.push({
        tag: "NavItem",
        name: "จัดการรายการ",
        icon: "pi pi-receipt",
        to: "/stock",
      });
    }

    if (_checkPermission("promotion")) {
      menuItems.push({
        tag: "NavItem",
        name: "โปรโมชัน",
        icon: "pi pi-sparkles",
        to: "/promotion",
      });
    }

    if (_checkPermission("permission")) {
      menuItems.push({
        tag: "NavItem",
        name: "สิทธิ์การใช้งาน",
        icon: "pi pi-key",
        to: "/permission",
      });
    }

    if (_checkPermission("user")) {
      menuItems.push({
        tag: "NavItem",
        name: "ผู้ใช้งาน",
        icon: "pi pi-user",
        to: "/user",
      });
    }

     if (_checkPermission("history")) {
      menuItems.push({
        tag: "NavItem",
        name: "ประวัติการเพิ่มสินค้า",
        icon: "pi pi-history",
        to: "/history",
      });
    }
    
    if (_checkPermission("history")) {
      menuItems.push({
        tag: "NavItem",
        name: "ประวัติการขายสินค้า",
        icon: "pi pi-shopping-bag",
        to: "/history-sales",
      });
    }

    return { menuprojectItems, menuItems };
  }
};

export default accessMenu;
