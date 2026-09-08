<?php

use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\ClientController;
use App\Controllers\CreditController;
use App\Controllers\CompteController;
use App\Controllers\EpargneController;
use App\Controllers\TransactionController;
use App\Controllers\RemboursementController;
use App\Controllers\AdminController;
use App\Controllers\BanqueController;

$router = new Router();

$authController = new AuthController();
$clientController = new ClientController();
$creditController = new CreditController();
$compteController = new CompteController();
$epargneController = new EpargneController();
$transactionController = new TransactionController();
$remboursementController = new RemboursementController();
$adminController = new AdminController();
$banqueController = new BanqueController();

//  Authentification 
$router->post('/api/register', [$authController, 'register']);
$router->post('/api/login', [$authController, 'login']);
$router->post('/api/admin/login', [$authController, 'loginAdmin']);

//  Profil et Dashboard  
$router->get('/api/profile', [$clientController, 'profile']);
$router->put('/api/profile', [$clientController, 'updateProfile']);
$router->get('/api/dashboard', [$clientController, 'dashboard']);

//  Épargne (client) 
$router->get('/api/savings', [$epargneController, 'show']);
$router->post('/api/savings/deposit', [$epargneController, 'deposit']);
$router->post('/api/savings/withdraw', [$epargneController, 'withdraw']);

//  Comptes 
$router->get('/api/accounts/mine', [$compteController, 'mine']);   // client
$router->get('/api/accounts', [$compteController, 'all']);          // admin

//  Crédits coté client 
$router->get('/api/loans/mine', [$creditController, 'mine']);
$router->post('/api/loans', [$creditController, 'requestCredit']);
$router->get('/api/loans/{id}', [$creditController, 'show']);
$router->post('/api/loans/{id}/repay', [$creditController, 'repay']);

//  Crédits coté admin 
$router->get('/api/loans', [$creditController, 'all']);
$router->post('/api/loans/{id}/approve', [$creditController, 'approve']);
$router->post('/api/loans/{id}/reject', [$creditController, 'reject']);

//  Remboursements pour admin enregistrement manuel 
$router->post('/api/repayments', [$remboursementController, 'record']);

//  Transactions  
$router->get('/api/transactions', [$transactionController, 'index']);

//  Admin uniquement 
$router->get('/api/clients', [$adminController, 'clients']);
$router->post('/api/clients', [$adminController, 'createClient']);
$router->put('/api/clients/{id}/status', [$adminController, 'updateClientStatus']);
$router->get('/api/admin/dashboard', [$adminController, 'dashboard']);

// Banque et opérations au guichet (admin uniquement)
$router->get('/api/admin/bank', [$banqueController, 'summary']);
$router->get('/api/admin/bank/history', [$banqueController, 'history']);
$router->post('/api/admin/bank/deposit', [$banqueController, 'deposit']);
$router->post('/api/admin/bank/withdraw', [$banqueController, 'withdraw']);
$router->post('/api/admin/bank/capital', [$banqueController, 'capital']);

return $router;
