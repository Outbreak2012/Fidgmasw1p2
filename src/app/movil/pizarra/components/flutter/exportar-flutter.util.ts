

/**
 * 
 * funciones para exportar a Flutter
 * 
 */


import { environment } from '../../../../../environments/environment.prod';
import { PageContent} from '../../interfaces/pagecontent';
import { files, GeminiService } from '../../services/gemini.service';

export function showLoadingModal(message: string) {
  let modal = document.getElementById('loading-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'loading-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';
    modal.innerHTML = `<div style="background:#fff;padding:32px 28px;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,0.18);min-width:320px;max-width:90vw;text-align:center;">
      <h2 id="loading-modal-message" style="margin-bottom:18px;font-size:1.3rem;color:#1976d2;">${message}</h2>
      <div class="spinner" style="margin: 24px auto 0; width: 48px; height: 48px; border: 6px solid #1976d2; border-top: 6px solid #e3e3e3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <style>@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }</style>
    </div>`;
    document.body.appendChild(modal);
  } else {
    const msg = document.getElementById('loading-modal-message');
    if (msg) msg.textContent = message;
    modal.style.display = 'flex';
  }
}

export function hideLoadingModal() {
  const modal = document.getElementById('loading-modal');
  if (modal) modal.remove();
}

export function exportarFlutterModal(
  allPagesContent: PageContent[],
  totalPages: number,
  pruebaq: (contenido: PageContent[], totalPages: number) => void,
  otraOpcionFlutter: (contenido: PageContent[], totalPages: number) => void
) {
  // MODAL para elegir opción
  const existingModal = document.getElementById('modal-flutter-export');
  if (existingModal) existingModal.remove();
  const modal = document.createElement('div');
  modal.id = 'modal-flutter-export';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.35)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '99999';
  modal.innerHTML = `
    <div style="background:#fff;padding:32px 28px;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,0.18);min-width:320px;max-width:90vw;text-align:center;">
      <h2 style="margin-bottom:18px;font-size:1.3rem;color:#1976d2;">¿Cómo deseas exportar?</h2>
      <button id="btn-exportar-flutter" style="background:#1976d2;color:#fff;padding:10px 18px;border:none;border-radius:8px;font-size:1rem;margin-bottom:12px;cursor:pointer;width:100%;font-weight:600;">Exportar como Flutter</button>
      <button id="btn-otra-opcion-flutter" style="background:#757575;color:#fff;padding:10px 18px;border:none;border-radius:8px;font-size:1rem;cursor:pointer;width:100%;font-weight:600;">Exportar En Web </button>
      <br><button id="btn-cerrar-modal-flutter" style="margin-top:18px;background:red; border-radius: 5px;padding: 8px;color:white;font-size:1.1rem;cursor:pointer;">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
  // Botón Exportar como Flutter
  document.getElementById('btn-exportar-flutter')?.addEventListener('click', () => {
    modal.remove();
    pruebaq(allPagesContent, totalPages);
  });
  // Botón Otra opción
  document.getElementById('btn-otra-opcion-flutter')?.addEventListener('click', () => {
    modal.remove();
    otraOpcionFlutter(allPagesContent, totalPages);
  });
  // Botón Cancelar
  document.getElementById('btn-cerrar-modal-flutter')?.addEventListener('click', () => {
    modal.remove();
  });
}

















// Exporta a Flutter en web (DartPad)

/**
 *  consigue todas la paginas de contenido de la paginas luego las pasa  geminiservice para convertir en codigo fluuter
 */
export async function exportarFlutterWeb(
  contenido: PageContent[],
  totalPages: number,
  geminiService: GeminiService,
  gistService: any,
  iframeDataService: any,
  routes: any,
  showLoadingModal: (msg: string) => void,
  hideLoadingModal: () => void
) {
  showLoadingModal('<span id="step-gemini">1. Generando código Flutter... <span id="check-gemini"></span></span><br><span id="step-gist">2. Subiendo a Gist... <span id="check-gist"></span></span>');
  let componentes: files[] = [];
  for (let i = 0; i < totalPages; i++) {
    const html = contenido[i].html;
    const css = contenido[i].css;
    try {

      /**
       * llama a geminiService para convertir el html y css en un componente de flutter
       * y agrega al array de componentes
       */
      componentes.push(await geminiService.textoAHtmlFlutter(html, css));
    } catch (e) {
      console.error(`Error procesando página ${i + 1} con GeminiService:`, e);
    }
  }
  // modal de espera  
  const checkGemini = document.getElementById('check-gemini');
  if (checkGemini) {
    checkGemini.innerHTML = '<span style="color:green;font-size:1.3em;">✔️</span>';
  }
  // Spinner en Gist
  const checkGist = document.getElementById('check-gist');
  if (checkGist) {
    checkGist.innerHTML = '<span class="spinner" style="margin-left:8px; width: 18px; height: 18px; border: 3px solid #1976d2; border-top: 3px solid #e3e3e3; border-radius: 50%; display:inline-block; animation: spin 1s linear infinite; vertical-align:middle;"></span>';
  }

  // Validación y creacion de codigo de principal Main e importaciones
  const valid = componentes.every(
    c => c && typeof c.classname === 'string' && typeof c.content === 'string'
  );
  if (!valid) {
    hideLoadingModal();
    console.error('Error: Algún componente no tiene la estructura correcta:', componentes);
    alert('Error: Algún componente generado no tiene la estructura correcta. Revisa la consola para más detalles.');
    return;
  }
  // Generar el main.dart que use el primer componente generado
  let mainCode = `import 'package:flutter/material.dart';\nimport 'package:flutter_svg/flutter_svg.dart';\n\n`;const cleanComponentes = componentes.map(c => ({
    ...c,
    content: c.content.replace(/import\s+['"]package:flutter\/material\\.dart['"]; 3*/g, '')
  }));
  mainCode += cleanComponentes.map(c => c.content).join('\n\n');
  const widgetNames = cleanComponentes.map(c => c.classname || 'MyWidget');
  mainCode += `\n\nvoid main() {\n  runApp(const MyApp());\n}\n\n`;
  mainCode += `class MyApp extends StatelessWidget {\n  const MyApp({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'Navigation Demo',\n      theme: ThemeData(primarySwatch: Colors.blue),\n      home: const MyHomePage(),\n    );\n  }\n}\n\n`;
  mainCode += `class MyHomePage extends StatelessWidget {\n  const MyHomePage({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        title: const Text('Navigation Demo'),\n      ),\n      body: Center(\n        child: Column(\n          mainAxisAlignment: MainAxisAlignment.center,\n          children: <Widget>[\n`;
  widgetNames.forEach((name, i) => {
    mainCode += `            ElevatedButton(\n              onPressed: () {\n                Navigator.push(\n                  context,\n                  MaterialPageRoute(builder: (context) => const ${name}()),\n                );\n              },\n              child: const Text('Go to ${name}'),\n            ),\n            const SizedBox(height: 20),\n`;
  });
  mainCode += `          ],\n        ),\n      ),\n    );\n  }\n}\n`;
  const token = environment?.githubToken || '';
  //-----------------------------------------------------------------------------------

  /**
   * esto a github el gist del codigo generado y mandamos a la ruta de ejecutar web que es dartpad.dev 
   */
 
   /**
    * llama al servicio de gistService para crear un Gist con el código Flutter generado
    */
  gistService.createGistFlutterCode(token, mainCode, 'Código Flutter generado desde la pizarra').subscribe({
    next: (response: any) => {
      // Palomita para Gist
      const checkGist2 = document.getElementById('check-gist');
      if (checkGist2) {
        checkGist2.innerHTML = '<span style="color:green;font-size:1.3em;">✔️</span>';
      }
      // Mostrar botón para ir a ejecutar web
      const gistId = response.id;
      const modal = document.getElementById('loading-modal');
      if (modal) {
        const msg = document.getElementById('loading-modal-message');
        if (msg) {
          msg.innerHTML = `<span id='step-gemini'>1. Generando código Flutter... <span style='color:green;font-size:1.3em;'>✔️</span></span><br><span id='step-gist'>2. Subiendo a Gist... <span style='color:green;font-size:1.3em;'>✔️</span></span><br><br><button id='btn-ir-ejecutarweb' style='margin-top:18px;background:#1976d2;color:#fff;padding:10px 18px;border:none;border-radius:8px;font-size:1rem;cursor:pointer;font-weight:600;'>Ir a ejecutar web</button>`;
        }
        setTimeout(() => {
          const btn = document.getElementById('btn-ir-ejecutarweb');
          if (btn) {
            btn.onclick = () => {
              hideLoadingModal();
              iframeDataService.setGistId(gistId);
              
              /** 
               * cambia la ruta a ejecutar web y le pasa el gistId como parametro
               */  
              routes.navigate(['/ejecutarweb'], { queryParams: { gist: gistId } });
            
            };
          }
        }, 100);
      }
    },
    error: (err: any) => {
      hideLoadingModal();
      console.error('Error al crear el Gist:', err);
      alert('Error al crear el Gist. Revisa la consola.');
    }
  });




}























// Exporta a Flutter ZIP
export async function exportarFlutterZip(
  contenido: PageContent[],
  totalPages: number,
  geminiService: any,
  exportarFlutterService: any
) {
  showLoadingModal('Generando componentes Flutter...');
  let componentes: files[] = [];
  for (let i = 0; i < totalPages; i++) {
    const html = contenido[i].html;
    const css = contenido[i].css;
    try {
      componentes.push(await geminiService.textoAHtmlFlutter(html, css));
    } catch (e) {
      console.error(`Error procesando página ${i + 1} con GeminiService:`, e);
    }
  }
  
  const valid = componentes.every(
    c => c && typeof c.classname === 'string' && typeof c.content === 'string'
  );
  if (!valid) {
    console.error('Error: Algún componente no tiene la estructura correcta:', componentes);
    alert('Error: Algún componente generado no tiene la estructura correcta. Revisa la consola para más detalles.');
    return;
  }
  const importaciones = `import 'package:flutter/material.dart';\nimport 'package:flutter_svg/flutter_svg.dart';\n\n`;
  const componentesConImports = componentes.map(c => ({
    ...c,
    content: importaciones +
      c.content
        .replace(/import\s+['"]package:flutter\/material\.dart['"];\s*/g, '')
        .replace(/import\s+['"]package:flutter_svg\/flutter_svg\.dart['"];\s*/g, '')
  }));

  exportarFlutterService.crearArchivosYDescargarZipFlutter(componentesConImports);
  hideLoadingModal();
}
