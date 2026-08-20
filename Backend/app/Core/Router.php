<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, $callback): void { $this->routes['GET'][$path] = $callback; }
    public function post(string $path, $callback): void { $this->routes['POST'][$path] = $callback; }
    public function put(string $path, $callback): void { $this->routes['PUT'][$path] = $callback; }
    public function delete(string $path, $callback): void { $this->routes['DELETE'][$path] = $callback; }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        
        $basePath = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        if ($basePath !== '/' && strpos($uri, $basePath) === 0) {
            $uri = substr($uri, strlen($basePath));
        }

        $uri = rtrim($uri, '/');
        if ($uri === '') {
            $uri = '/';
        }

        if (isset($this->routes[$method][$uri])) {
            $this->invoke($this->routes[$method][$uri]);
            return;
        }

        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $routePath => $callback) {
                $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $routePath);
                $pattern = '#^' . $pattern . '$#';

                if (preg_match($pattern, $uri, $matches)) {
                    $params = array_filter($matches, fn($key) => is_string($key), ARRAY_FILTER_USE_KEY);
                    $this->invoke($callback, array_values($params));
                    return;
                }
            }
        }

        $this->notFound();
    }

    private function invoke($callback, array $params = []): void
    {
        if (is_array($callback)) {
            [$controller, $method] = $callback;
            call_user_func_array([$controller, $method], $params);
            return;
        }
        call_user_func_array($callback, $params);
    }

    private function notFound(): void
    {
        Security::jsonResponse([
            'success' => false,
            'message' => 'Route introuvable.',
        ], 404);
    }
}
