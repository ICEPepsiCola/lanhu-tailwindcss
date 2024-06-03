import { getCSSPropertys } from "@/lib/dom";
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
    const copyCode = document.getElementById('copy_code');
    if (!copyCode) {
      toast("请先选中设计稿", { autoClose: 100 });
      return;
    }
    const tailwindCode = await getCSSPropertys();
    navigator.clipboard.writeText(tailwindCode);
    toast("复制成功", { autoClose: 100 });
  });
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