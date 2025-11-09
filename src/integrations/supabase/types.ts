export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cash_disbursements: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string | null
          date: string
          description: string | null
          id: string
          paid_to: string
          purpose: string | null
          received_by: string | null
          updated_at: string
          voucher_number: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          description?: string | null
          id?: string
          paid_to: string
          purpose?: string | null
          received_by?: string | null
          updated_at?: string
          voucher_number: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          description?: string | null
          id?: string
          paid_to?: string
          purpose?: string | null
          received_by?: string | null
          updated_at?: string
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_disbursements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_invoice_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cash_receipts: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string | null
          date: string
          description: string | null
          id: string
          purpose: string | null
          received_by: string | null
          received_from: string
          updated_at: string
          voucher_number: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          description?: string | null
          id?: string
          purpose?: string | null
          received_by?: string | null
          received_from: string
          updated_at?: string
          voucher_number: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          description?: string | null
          id?: string
          purpose?: string | null
          received_by?: string | null
          received_from?: string
          updated_at?: string
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sales_invoice_items: {
        Row: {
          available_quantity: number | null
          created_at: string
          discount_percentage: number | null
          id: string
          invoice_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string
          discount_percentage?: number | null
          id?: string
          invoice_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          available_quantity?: number | null
          created_at?: string
          discount_percentage?: number | null
          id?: string
          invoice_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sales_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "cash_sales_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sales_invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sales_invoice_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sales_invoices: {
        Row: {
          change_amount: number | null
          created_at: string
          customer_id: string | null
          customer_phone: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          payment_amount: number | null
          sales_representative: string | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          change_amount?: number | null
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          payment_amount?: number | null
          sales_representative?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          change_amount?: number | null
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          payment_amount?: number | null
          sales_representative?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      check_disbursements: {
        Row: {
          amount: number
          bank_name: string
          check_number: string
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          paid_to: string
          purpose: string | null
          updated_at: string
          voucher_number: string
        }
        Insert: {
          amount?: number
          bank_name: string
          check_number: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          paid_to: string
          purpose?: string | null
          updated_at?: string
          voucher_number: string
        }
        Update: {
          amount?: number
          bank_name?: string
          check_number?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          paid_to?: string
          purpose?: string | null
          updated_at?: string
          voucher_number?: string
        }
        Relationships: []
      }
      check_receipts: {
        Row: {
          amount: number
          bank_name: string
          check_date: string
          check_number: string
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          due_date: string | null
          id: string
          purpose: string | null
          received_from: string
          updated_at: string
          voucher_number: string
        }
        Insert: {
          amount?: number
          bank_name: string
          check_date: string
          check_number: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          purpose?: string | null
          received_from: string
          updated_at?: string
          voucher_number: string
        }
        Update: {
          amount?: number
          bank_name?: string
          check_date?: string
          check_number?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          purpose?: string | null
          received_from?: string
          updated_at?: string
          voucher_number?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_sales_invoice_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      credit_sales_invoice_items: {
        Row: {
          available_quantity: number | null
          created_at: string
          discount_percentage: number | null
          id: string
          invoice_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string
          discount_percentage?: number | null
          id?: string
          invoice_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          available_quantity?: number | null
          created_at?: string
          discount_percentage?: number | null
          id?: string
          invoice_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_sales_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "credit_sales_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_sales_invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_sales_invoice_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_sales_invoices: {
        Row: {
          created_at: string
          customer_id: string | null
          employee_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number | null
          remaining_amount: number | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          employee_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          employee_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_sales_invoices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      custody_disbursements: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          created_by: string | null
          custodian_name: string
          date: string
          description: string | null
          expected_return_date: string | null
          id: string
          purpose: string | null
          updated_at: string
          voucher_number: string
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          custodian_name: string
          date?: string
          description?: string | null
          expected_return_date?: string | null
          id?: string
          purpose?: string | null
          updated_at?: string
          voucher_number: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          custodian_name?: string
          date?: string
          description?: string | null
          expected_return_date?: string | null
          id?: string
          purpose?: string | null
          updated_at?: string
          voucher_number?: string
        }
        Relationships: []
      }
      custody_settlements: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          custodian_name: string
          custody_disbursement_id: string | null
          date: string
          id: string
          notes: string | null
          original_amount: number
          returned_amount: number
          settlement_date: string
          spent_amount: number
          updated_at: string
          voucher_number: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          custodian_name: string
          custody_disbursement_id?: string | null
          date?: string
          id?: string
          notes?: string | null
          original_amount?: number
          returned_amount?: number
          settlement_date: string
          spent_amount?: number
          updated_at?: string
          voucher_number: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          custodian_name?: string
          custody_disbursement_id?: string | null
          date?: string
          id?: string
          notes?: string | null
          original_amount?: number
          returned_amount?: number
          settlement_date?: string
          spent_amount?: number
          updated_at?: string
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "custody_settlements_custody_disbursement_id_fkey"
            columns: ["custody_disbursement_id"]
            isOneToOne: false
            referencedRelation: "custody_disbursements"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          business_owner_name: string
          country_id: string | null
          created_at: string
          credit_limit: number | null
          customer_code: string
          customer_type_id: string | null
          email: string | null
          id: string
          institution_name: string | null
          location_link: string | null
          opening_balance: number | null
          phone: string | null
          phone_number: string | null
          province_id: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          business_owner_name: string
          country_id?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_code: string
          customer_type_id?: string | null
          email?: string | null
          id?: string
          institution_name?: string | null
          location_link?: string | null
          opening_balance?: number | null
          phone?: string | null
          phone_number?: string | null
          province_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          business_owner_name?: string
          country_id?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_code?: string
          customer_type_id?: string | null
          email?: string | null
          id?: string
          institution_name?: string | null
          location_link?: string | null
          opening_balance?: number | null
          phone?: string | null
          phone_number?: string | null
          province_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_customer_type_id_fkey"
            columns: ["customer_type_id"]
            isOneToOne: false
            referencedRelation: "customer_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_order_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dispatch_order_items: {
        Row: {
          created_at: string
          dispatch_order_id: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dispatch_order_id: string
          id?: string
          product_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dispatch_order_id?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      dispatch_orders: {
        Row: {
          created_at: string
          description: string | null
          employee_id: string | null
          id: string
          order_number: string
          permit_number: string | null
          status: string | null
          total_items: number | null
          total_pieces: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          order_number: string
          permit_number?: string | null
          status?: string | null
          total_items?: number | null
          total_pieces?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          order_number?: string
          permit_number?: string | null
          status?: string | null
          total_items?: number | null
          total_pieces?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses_disbursements: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          expense_category: string
          id: string
          paid_to: string
          payment_method: string | null
          purpose: string | null
          updated_at: string
          voucher_number: string
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          expense_category: string
          id?: string
          paid_to: string
          payment_method?: string | null
          purpose?: string | null
          updated_at?: string
          voucher_number: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          expense_category?: string
          id?: string
          paid_to?: string
          payment_method?: string | null
          purpose?: string | null
          updated_at?: string
          voucher_number?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          code_prefix: string | null
          created_at: string
          discount_percentage: number | null
          id: string
          image_url: string | null
          name: string
          opening_balance: number | null
          product_code: string
          purchase_limit: number | null
          reorder_level: number | null
          sale_price: number | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          code_prefix?: string | null
          created_at?: string
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          name: string
          opening_balance?: number | null
          product_code: string
          purchase_limit?: number | null
          reorder_level?: number | null
          sale_price?: number | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          code_prefix?: string | null
          created_at?: string
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          name?: string
          opening_balance?: number | null
          product_code?: string
          purchase_limit?: number | null
          reorder_level?: number | null
          sale_price?: number | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          country_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          country_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          description: string | null
          employee_id: string | null
          id: string
          order_number: string
          permit_number: string | null
          status: string | null
          total_items: number | null
          total_pieces: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          order_number: string
          permit_number?: string | null
          status?: string | null
          total_items?: number | null
          total_pieces?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          order_number?: string
          permit_number?: string | null
          status?: string | null
          total_items?: number | null
          total_pieces?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          discount_percentage: number | null
          id: string
          product_id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          product_id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          product_id?: string
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          customer_id: string | null
          discount_amount: number | null
          employee_id: string | null
          id: string
          notes: string | null
          quotation_date: string
          quotation_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          terms_and_conditions: string | null
          total_amount: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          quotation_date?: string
          quotation_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_and_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          quotation_date?: string
          quotation_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_and_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      treasury_balance: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_updated: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_updated?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_updated?: string
        }
        Relationships: []
      }
      units_of_measure: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      warehouse_stock: {
        Row: {
          id: string
          last_updated: string
          product_id: string
          quantity: number
          warehouse_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          product_id: string
          quantity?: number
          warehouse_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          product_id?: string
          quantity?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_transaction_codes: {
        Row: {
          created_at: string
          current_code: number
          id: string
          prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_code?: number
          id?: string
          prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_transaction_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          transaction_id: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          transaction_id: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          transaction_id?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "warehouse_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          reference_number: string | null
          status: string | null
          transaction_date: string
          transaction_number: string
          transaction_type: string
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string | null
          transaction_date?: string
          transaction_number: string
          transaction_type: string
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string | null
          transaction_date?: string
          transaction_number?: string
          transaction_type?: string
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_transactions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          name_ar: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_ar: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_ar?: string
          updated_at?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          updated_at: string
          warehouse_type_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          updated_at?: string
          warehouse_type_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
          warehouse_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_warehouse_type_id_fkey"
            columns: ["warehouse_type_id"]
            isOneToOne: false
            referencedRelation: "warehouse_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_barcode: { Args: never; Returns: string }
      generate_cash_invoice_number: { Args: never; Returns: string }
      generate_credit_invoice_number: { Args: never; Returns: string }
      generate_customer_code: { Args: never; Returns: string }
      generate_dispatch_order_number: { Args: never; Returns: string }
      generate_product_code: { Args: never; Returns: string }
      generate_purchase_order_number: { Args: never; Returns: string }
      generate_quotation_number: { Args: never; Returns: string }
      generate_warehouse_transaction_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
