import { Injectable } from "@angular/core";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { environment } from "../../../../environments/environment.prod";

@Injectable({
  providedIn: "root",
})

export class GeminiService {

  ai = new GoogleGenAI({ apiKey: environment.key });




  /**
   * en base una imagen genera codigo html de vistas o interfaces de usuario estilo movil
   * y devuelve codigo 
   *  
   */

  async textToImage(file: File): Promise<string> {
    const image = await this.ai.files.upload({ file });
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        createUserContent([
          createPartFromUri(image.uri!, image.mimeType!),

        ]),
      ],
      config: {
        systemInstruction: `
You are an expert in converting mobile UI designs into inline HTML/CSS. Transform interface images (apps, mobile websites) into clean and responsive code following these rules:
📌 IMPORTANT:
- You can return the full HTML structure, including <html>, <head>, <meta>, and <body> tags.
- All CSS must be inline (using the style attribute).
- Code must be fully self-contained, with no external dependencies.
- Always define a background color explicitly for every visible container and component — including the <body> tag — even if the color is white. Do not leave any element with a transparent or inherited background.

1. STRUCTURE
- Use semantic HTML (header, main, button)
- 100% inline CSS
- Include a mobile-friendly <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

2. MOBILE-FIRST
- Minimum width: 375px
- Buttons: minimum size of 44x44px
- No hover styles, only :active

3. PLACEHOLDERS
- Images: <div style="width:[W]px; height:[H]px; background:linear-gradient(...)">
- Icons: basic SVG (e.g. <circle cx="12" cy="12" r="10" fill="#9E9E9E">)

4. ANTI-OVERFLOW
- Use overflow-x:hidden on containers
- Text: white-space:nowrap; text-overflow:ellipsis

5. BASE COMPONENTS
Sticky header example:
<header style="position:sticky; top:0; height:56px; display:flex; align-items:center; background:white; box-shadow:0 2px 4px rgba(0,0,0,0.1);">

6. BEST PRACTICES
- Use Flexbox/Grid
- Pixel-perfect fidelity to the design
- Placeholders must keep the original dimensions
- Every visible element must have a defined background color — including the <body> — to avoid layout or rendering inconsistencies.
  `,
      }




    });
    //console.log(response.text);
    return response.text ?? '';
  }





  async generacionTexto(texto: string, prompt: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        createUserContent([
          prompt, texto,
        ]),
      ],
    });
    return response.text;
  }



  /**
   * funcion que genera un html con el prompt enviado
   * @param texto 
   * @returns 
   */
  async generacionHtmlFlutter(texto: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        createUserContent([
          texto, `Generate HTML code that implements Material Design 3 (as in Flutter) to display the description I provide.
    Requirements:
    1. Use inline styles to faithfully replicate Flutter/Material 3 components
    2. Include these Flutter elements:
    - Layouts (Row, Column, Stack)
    - Widgets (Card, ListTile, Chip, etc.)
    - Inputs (TextField, Checkbox, etc.)
    - Navigation patterns
    - Material Design 3 components
    3. Mandatory features:
    - Do not make it responsive
    - Only essential code, no comments
    - Clean and minimalist structure
    - Fidelity to Flutter's look & feel
    4. Exclude:
    - Meta tags
    - External CSS
    - JavaScript
    - Non-essential elements
    The HTML must be standalone with all styles inline.`
        ]),
      ],
      config: {
        systemInstruction: 'You are an expert at generating Flutter-style HTML code. Return only the HTML code.',
      },
    });

    return response.text;
  }


  /**
   *  de audio a html flutter
   * @file file 
   * @return el codigo html flutter
   *  */
  async audioAHtmlFlutter(file: File): Promise<string> {
    // Subir el archivo de audio
    const audio = await this.ai.files.upload({ file });
    // Llamar a Gemini con el archivo y el prompt de Flutter
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        createUserContent([
          `Generate HTML code that implements Material Design 3 (as in Flutter)
    to display the description of the audio I provide.\nRequirements:\n1.
    Use inline styles to faithfully replicate Flutter/Material 3 components\n2.
    Include these Flutter elements:\n- Layouts (Row, Column, Stack)\n
    - Widgets (Card, ListTile, Chip, etc.)\n- Inputs (TextField, Checkbox, etc.)\n
    - Navigation patterns\n- Material Design 3 components\n3. Mandatory features:\n
    - Do not make it responsive\n- Only essential code, no comments\n
    - Clean and minimalist structure\n- Fidelity to Flutter's look & feel\n4. Exclude:\n
    - Meta tags\n- External CSS\n- JavaScript\n- Non-essential elements\n
    The HTML must be standalone with all styles inline.`,
          createPartFromUri(audio.uri!, audio.mimeType!),
        ]),
      ],
      config: {
        systemInstruction: 'You are an expert at generating Flutter-style HTML code from audio. Return only HTML code.',
      },

    });
    return response.text ?? '';
  }



  /**
   * Convierte HTML y CSS a código Flutter 3 (Dart) con buenas prácticas y prevención de errores comunes.
   * @param html - Código HTML a convertir.
   * @param css - Código CSS asociado al HTML.
   * @returns Un objeto con el nombre de clase y el contenido del código Flutter generado.
   */
  async textoAHtmlFlutter(html: string, css: string): Promise<files> {
    // Generar un nombre de componente aleatorio
    const randomStr = Math.random().toString(36).substring(2, 10);
    const componentName = `Component${randomStr}`;

    const prompt = `
        Your task is to convert HTML and CSS into fully functional Flutter 3 (Dart) code.  
        ### General Requirements:
        - Use a \`StatelessWidget\` class named as provided.
        - The root widget must be \`SingleChildScrollView\` to prevent vertical overflow.
        - All code must be wrapped in a \`Material\` or \`Scaffold\` widget to ensure proper rendering of Material Design components.
        ### Base Structure:
        \`\`\`dart
        class ${componentName} extends StatelessWidget {
          const ${componentName}({super.key});
          @override
          Widget build(BuildContext context) {
            return Scaffold(
              body: SingleChildScrollView(
                child: // converted content here
              ),
            );
          }
        }
        \`\`\`
        Replace ${componentName} with the provided component name.
        ---
        ### HTML → Flutter Element Mapping:
        | HTML Element   | Flutter Widget                                                              |
        |----------------|------------------------------------------------------------------------------|
        | <div>          | Container, SizedBox, Padding depending on context and size                  |
        | <h1>-<h6>      | Text(...) with Theme.of(context).textTheme.headlineX                        |
        | <p>            | Text(...) wrapped in Expanded or Flexible with overflow: TextOverflow.ellipsis |
        | <img>          | Image.network(...) with BoxFit.cover and fixed width and height             |
        | <button>       | ElevatedButton(onPressed: () { ... })                                       |
        | <ul>, <ol>     | ListView.builder(...) with shrinkWrap: true, NeverScrollableScrollPhysics() |
        | <svg>          | Convert to SvgPicture.string(...) or SvgPicture.asset(...) using flutter_svg |
        ---
        ### Mandatory Rules and Validations:
        1. Overflow:
           - All Text widgets inside Column or Row must be wrapped in Expanded or Flexible.
           - Use SingleChildScrollView for long vertical content.
           - Use horizontal ListView for inline content.
        2. Size Constraints:
           - Images must have explicit width and height.
           - Use ConstrainedBox with maxWidth or maxHeight to prevent unbounded growth in containers.
        3. Null Safety:
           - Use \`required\` for all required parameters.
           - Custom widget constructors must accept \`Key? key\`.
        4. Material Design:
           - Any Material widget (e.g., ElevatedButton) must be inside a Scaffold or Material widget.
        5. Best Practices:
           - Use \`const\` for static widgets.
           - Group complex layouts into custom components.
           - Use \`overflow: TextOverflow.ellipsis\` for long text.
           - Always define \`BoxFit\` for images.
           - Use flutter_svg package for handling SVGs.
        ---
        ### SVG Conversion Example:

        \`\`\`html
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="black"/>
        </svg>
        \`\`\`

        \`\`\`dart
        import 'package:flutter_svg/flutter_svg.dart';
        SvgPicture.string(
          '''
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="black"/>
          </svg>
          '''
        )
        \`\`\`
        ---
        ### Output Format:
        \`\`\`dart
        // Full Dart code with a functional ComponentName class
        // Explanatory comments for key parts (e.g., Expanded usage, image sizing, SVG usage)
        \`\`\`
        ### Input:
        \`\`\`html
        ${html},
        ${css}
        <!-- HTML and CSS code -->
        \`\`\`
        `;
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [
        createUserContent([
          prompt,
        ]),
      ],
      config: {
        systemInstruction: 'Eres un programador experto en pasar codigo html css a flutter 3, no devuelvas mas que codigo flutter'
      }
    });
    let flutterCode = response.text ?? '';
    flutterCode = flutterCode.replace(/^```dart\s*/i, '').replace(/```\s*$/i, '');
    flutterCode = flutterCode.replace(/^\s*import\s+['"][^'"]+['"];\s*$/gm, '');
    return {
      classname: componentName,
      content: flutterCode,
    };
  }


}

export interface files {
  classname: string;
  content: string;

}