import { getImagePropertys, getHTMLPropertys, saveImage } from "@/lib/dom";
import ReactDOM from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default defineContentScript({
  matches: ['*://*.lanhuapp.com/*'],
  runAt: 'document_end',
  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      onMount: (container) => {
        // Create a root on the UI container and render a component
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        // Unmount the root when the UI is removed
        root?.unmount();
      },
    });
    ui.mount();
    checkBindLayerInteractive();
  },
});

async function generateTailwindCode(isToast: boolean = true) {
  const copyCode = document.getElementById('copy_code');
  const sliceImgBox = document.querySelectorAll('.annotation_container.lanhu_scrollbar.flag-pl .annotation_item');
  if (copyCode) {
    const tailwindCode = await getHTMLPropertys();
    navigator.clipboard.writeText(tailwindCode);
    isToast && toast("复制成功", { autoClose: 100 });
    return { element: 'div', className: tailwindCode };
  }
  if (sliceImgBox && sliceImgBox.length) {
    const tailwindCode = await getImagePropertys();
    navigator.clipboard.writeText(tailwindCode);
    isToast && toast("复制成功", { autoClose: 100 });
    const fileName = await saveImage();
    return { element: 'img', className: tailwindCode, fileName };
  }
  toast("请先选中设计稿", { autoClose: 100 });
}

// 循环检测是否绑定点击事件
function checkBindLayerInteractive() {
  const operation = document.querySelector('.operation-wrap')!;
  if (!operation) {
    window.check_layer_interactive = setTimeout(() => {
      clearTimeout(window.check_layer_interactive);
      checkBindLayerInteractive();
    }, 300);
    return;
  }
  const div = document.createElement('div');
  const copyTailwindCode = document.createElement('span');
  copyTailwindCode.id = 'copy_tailwind_code';
  copyTailwindCode.textContent = 'TailwindCSS';
  copyTailwindCode.style.setProperty('cursor', 'pointer');
  copyTailwindCode.style.setProperty('border-radius', '16px');
  copyTailwindCode.style.setProperty('padding', '4px 8px');
  copyTailwindCode.style.setProperty('background-color', 'rgba(40, 120, 255, 0.15)');
  copyTailwindCode.style.setProperty('color', '#2878ff');
  copyTailwindCode.style.setProperty('margin', '0 8px');
  copyTailwindCode.addEventListener('click', async () => {
    generateTailwindCode();
  });
  // 生成并且复制HTML代码
  const copyHTMLCode = document.createElement('span');
  copyHTMLCode.id = 'copy_html_code';
  copyHTMLCode.textContent = 'TailwindHTML';
  copyHTMLCode.style.cssText = copyTailwindCode.style.cssText;
  copyHTMLCode.addEventListener('click', async () => {
    const result = await generateTailwindCode(false);
    if (!result) return;
    const { element, className, fileName } = result;
    let html = '';
    if (element === 'div') {
      html = `<div className='${className}'></div>`;
    } else if (element === 'img') {
      html = `<COSImg src='${fileName}' className='${className}' />`;
    }
    navigator.clipboard.writeText(html);
    toast("复制成功", { autoClose: 100 });
  });
  div.appendChild(copyHTMLCode);
  div.appendChild(copyTailwindCode);
  operation.appendChild(div);
}



function App() {
  return (
    <div>
      <ToastContainer />
    </div>
  );
}