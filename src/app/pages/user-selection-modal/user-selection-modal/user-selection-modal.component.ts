import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { IonicModule, ModalController } from "@ionic/angular";
import { ApiService } from "src/app/services/api.service";

interface User {
  reference_number: string;
  id: number;
  grade: string;
  gender: string;
  age: number;
  wears_spectacles: string;
  school: string;
  created_at: string;
  name: string | null;
  referral_clinic: string;
  surname?: string;
  contact_number?: string;
  relationship?: string;
  contact_first_name?: string;
  contact_surname?: string;

  // Added for UI/search convenience
  displayName?: string;
  displayEmail?: string;
}

@Component({
  selector: "app-user-selection-modal",
  templateUrl: "./user-selection-modal.component.html",
  styleUrls: ["./user-selection-modal.component.scss"],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
})
export class UserSelectionModalComponent implements OnInit {
  userForm: FormGroup;
  submitted = false;
  showDropdown = false;
  searchControl = new FormControl<string>("");

  users: User[] = [];
  filteredUsers: User[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private router: Router,
    private apiService: ApiService
  ) {
    this.userForm = this.formBuilder.group({
      selectedUser: [null, Validators.required], // store the full object
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filterUsers(searchTerm || "");
    });
  }

  async goToRegister() {
    await this.modalController.dismiss();
    this.router.navigate(["/layout/first-screening"]);
  }

  loadUsers() {
    this.apiService.getParticipant().subscribe(
      (res: any) => {
        const data = Array.isArray(res) ? res : res.body;

        this.users = (data || []).map((user: User) => ({
          ...user,
          displayName: this.getDisplayName(user),
          displayEmail: this.getDisplayEmail(user),
        }));

        // sort by name
        this.users.sort((a, b) =>
          (a.displayName || "").toLowerCase().localeCompare((b.displayName || "").toLowerCase())
        );

        this.filteredUsers = [...this.users];
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );
  }

  getDisplayName(user: User): string {
    if (!user?.name && !user?.surname) {
      return `User ${user?.reference_number ?? ""}`.trim();
    }
    return `${user?.name || ""} ${user?.surname || ""}`.trim();
  }

  getDisplayEmail(user: User): string {
    if (user?.contact_number) {
      return `${user.contact_number} • ${user.relationship || "Contact"}`;
    }
    return user?.reference_number || "";
  }

  getInitials(user: User): string {
    const parts = `${user?.name || ""} ${user?.surname || ""}`.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last).toUpperCase();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  trackById(_i: number, user: User) {
    return user.id ?? user.reference_number;
  }

  selectUser(user: User) {
    this.userForm.patchValue({ selectedUser: user }); // store the full object
    this.showDropdown = false;

    // Reset search & list after selection
    this.searchControl.setValue("");
    this.filteredUsers = [...this.users];
  }

  clearSelection() {
    this.userForm.patchValue({ selectedUser: null });
    this.showDropdown = false;
    this.searchControl.setValue("");
    this.filteredUsers = [...this.users];
  }

  filterUsers(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter((user) =>
      (user.displayName || "").toLowerCase().includes(searchLower) ||
      (user.displayEmail || "").toLowerCase().includes(searchLower) ||
      (user.reference_number || "").toLowerCase().includes(searchLower) ||
      (user.contact_number || "").toLowerCase().includes(searchLower)
    );
  }

  clearSearch() {
    this.searchControl.setValue("");
    this.filteredUsers = [...this.users];
  }

  async submit() {
    this.submitted = true;
    if (this.userForm.valid) {
      const selectedUser = this.userForm.get("selectedUser")?.value as User | null;
      if (selectedUser) {
        await this.modalController.dismiss({ selectedUser });
      }
    }
  }

  async cancel() {
    await this.modalController.dismiss();
  }

  backLocation(){
    this.router.navigate(['/layout/profile']);
    this.modalController.dismiss()
  }

}
