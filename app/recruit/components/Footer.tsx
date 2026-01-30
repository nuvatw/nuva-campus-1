export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border-light bg-bg-secondary/30">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-text-muted">© 2025 NUVA. 台灣全國校園巡迴計劃</p>
        <p className="text-sm text-text-muted mt-2">
          資料來源：<a href="https://udb.moe.edu.tw/ulist/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">教育部 114 學年度大專校院一覽表</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
