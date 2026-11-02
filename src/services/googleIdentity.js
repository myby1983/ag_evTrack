let scriptPromise;

export function loadGoogleIdentity() {
    if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        const fail = () => {
            clearTimeout(timeout);
            script.onload = script.onerror = null;
            script.remove();
            scriptPromise = undefined;
            reject(new Error('Could not load Google sign-in. Check your connection or browser settings, then retry.'));
        };
        const timeout = setTimeout(fail, 15000);
        script.onerror = fail;
        script.onload = () => {
            if (!window.google?.accounts?.id) return fail();
            clearTimeout(timeout);
            resolve(window.google.accounts.id);
        };
        document.head.appendChild(script);
    });
    return scriptPromise;
}
