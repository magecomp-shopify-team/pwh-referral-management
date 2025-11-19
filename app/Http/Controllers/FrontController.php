<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FrontController extends Controller
{
    public function __construct()
    {
        $this->middleware('verify.shopify')->only('index');
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        return view("react", ["user" => $user]);
    }
}
