import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ContractTopbarComponent } from "../../TopBar/contract-topbar/contract-topbar.component";
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone:true,
  imports: [ContractTopbarComponent, CommonModule, FormsModule],
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContractComponent implements OnInit {
  contractData = {
    contract_type: '',
    owner_id: null,
    buyer_id: null,
    apartment_id: null,
    contract_details: '',
    
    // For printable contract text
    owner_full_name: '',
    owner_id_number: '',
    owner_address: '',
    
    buyer_full_name: '',
    buyer_id_number: '',
    buyer_address: '',
    
    apartment_city: '',
    apartment_location: '',

    rent_amount: '',
    currency: '',
    due_date:''
  };
  
  
  selectedLanguage: string = 'ar'; // default is Arabic

  contractTypes = ['Sale', 'Rent'];
  owners: any[] = [];
  buyers: any[] = [];
  apartments: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
    this.loadApartments();
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:5000/users').subscribe(data => {
      this.owners = data.filter(u => u.role === 'Administrator'); //should be owner
      this.buyers = data.filter(u => u.role === 'Buyer/Tenant');
    });
  }

  loadApartments() {
    this.http.get<any[]>('http://localhost:5000/apartments').subscribe(data => {
      this.apartments = data.filter(apt => apt.status === 'Available');
    });
  }

  submitContract() {
    const selectedApartment = this.apartments.find(a => a.id == this.contractData.apartment_id);
    const selectedOwner = this.owners.find(o => o.id == this.contractData.owner_id);
    const selectedBuyer = this.buyers.find(b => b.id == this.contractData.buyer_id);    
    
    
    if (!selectedApartment || !selectedOwner || !selectedBuyer) {
      alert('Please select owner, buyer, and apartment to proceed.');
      return;
    }
  
    const rentAmount = this.contractData.rent_amount;
    const currency = this.contractData.currency;
    
    const dueDate = new Date(this.contractData.due_date);
    const formattedDueDate = dueDate.toLocaleDateString(this.selectedLanguage === 'ar' ? 'ar-EG' : 'en-GB');

    const address = `${this.contractData.apartment_location}, ${this.contractData.apartment_city}`;
    const unitNumber = selectedApartment.unit_number;
    const contractType = this.contractData.contract_type;
    const today = new Date().toLocaleDateString(this.selectedLanguage === 'ar' ? 'ar-EG' : 'en-GB');

    let contractDetails = '';

    if (this.selectedLanguage === 'ar') {
       contractDetails = `
        هذا العقد مُبرم في هذا اليوم الموافق ${today} بين:
        
        الطرف الأول (المؤجر):
        السيد / ${this.contractData.owner_full_name}، صاحب البطاقة رقم ${this.contractData.owner_id_number}، والمقيم في ${this.contractData.owner_address}، والمالك الشرعي للعقار الموجود في ${address}.

        الطرف الثاني (${contractType === 'Rent' ? 'المستأجر' : 'المشتري'}):
        السيد / ${this.contractData.buyer_full_name}، صاحب البطاقة رقم ${this.contractData.buyer_id_number}، والمقيم في ${this.contractData.buyer_address}، والراغب في ${contractType === 'Rent' ? 'استئجار' : 'شراء'} العقار المعروف بالوحدة رقم ${unitNumber}.
          
        تمهيد:
        
        بموجب هذا العقد، يمتلك الطرف الأول العقار المذكور أعلاه بالكامل وهو مسؤول عن صيانته وإصلاح أي عيوب به.
        
        البند الأول:
        يعتبر التمهيد السابق جزءًا لا يتجزأ من هذا العقد.

        البند الثاني:
        بموجب هذا العقد، يُقدّم الطرف الأول العقار المذكور أعلاه للطرف الثاني للاستخدام السكني وفقًا للشروط والأحكام الواردة في هذا العقد.
        
        البند الثالث:
        ${contractType === 'Rent' ? `القيمة الإيجارية المتفق عليها تبلغ ${rentAmount} ${currency} ويجب دفعها مقدمًا كل شهر.` : `سعر البيع المتفق عليه هو ${rentAmount} ${currency}، يتم دفعه مرة واحدة نقدًا أو عبر الوسائل المتفق عليها.`}
        
        البند الرابع:
        مدة هذا العقد تبدأ من تاريخ توقيعه وتنتهي في [${dueDate.toLocaleDateString()}].
        
        البند الخامس:
        في حالة تأخر الطرف الثاني في دفع الإيجار في المواعيد المحددة، سيتحق للطرف الأول الحق في مطالبته بالمبالغ المستحقة والتكاليف الرسمية وغير الرسمية، بالإضافة إلى حقه في إنهاء العقد دون الحاجة لحكم قضائي مسبق، أو إجراءات رسمية.

        البند السادس:
        يمنع على الطرف الثاني تأجير العقار أو التنازل عن الإيجار أو أي جزء من الملكية العقارية دون الحصول على موافقة كتابية مسبقة من الطرف الأول.

        البند السابع:
        يتعهد الطرف الثاني باستخدام العقار المؤجر بعناية ومسؤولية وفقًا للشروط الواردة في هذا العقد. يجب عليه المحافظة على العقار والامتناع عن إحداث أي ضرر أو تغيير بالعقار دون الحصول على موافقة كتابية من الطرف الأول.

        البند الثامن:
        يحظر على الطرف الثاني إجراء أي تغييرات بالعقار مثل هدم أو بناء أو تقسيم الغرف أو فتح نوافذ وأبواب دون الحصول على موافقة كتابية مسبقة من الطرف الأول. وفي حالة القيام بذلك بدون موافقة، يجب عليه إعادة العقار إلى حالته الأصلية على نفقته الخاصة.

        البند التاسع:
        الطرف الثاني مسؤول عن أي تجهيزات أو تغييرات في العقار، ويجب عليه إجراء أي أعمال صيانة أو إصلاحات تكون ضرورية خلال فترة الإيجار. جميع الأعمال والتغييرات يتعين عليه تنفيذها على نفقته الخاصة، وليس له حق المطالبة بتعويض عنها.

        البند العاشر:
        جميع الممتلكات الشخصية التي تم جلبها إلى العقار من قبل الطرف الثاني تعتبر ملكية شخصية وليست ملكية للطرف الأول. في حالة عدم دفع الإيجار وتوجيه مطالبات قانونية، سيكون للطرف الأول حق الاحتجاز التحفظي لهذه الممتلكات.

        البند الحادي عشر:
        جميع أعمال الصيانة الروتينية والتكاليف المتعلقة بالمياه والكهرباء وأجرة البوابة تكون على عاتق الطرف الثاني.

        البند الثاني عشر:
        في حالة حدوث مشكلة تؤثر على العقار، يحق للطرف الأول إخراج الطرف الثاني من العقار بناءً على إشعار شفهي، ويحق له أيضًا اتخاذ الإجراءات اللازمة لحماية الممتلكات. ليس للطرف الثاني الحق في الاعتراض على هذه الإجراءات.

        البند الثالث عشر:
        كل أعمال الصيانة والإصلاحات التي تتطلبها العقار خلال فترة الإيجار يتعين على الطرفين تكاليفها وتنفيذها.

        البند الرابع عشر:
        الطرف الأول ليس مسؤولًا تجاه الطرف الثاني بما ينسب إلى الأعمال أو الأحداث التي تنشأ نتيجة للجيران أو الأطراف الأخرى أو أي خلافات أو مشاكل تؤثر على العقار.

        البند الخامس عشر:
        سيتحمل الطرف الثاني نفقات الاستهلاك للمياه والكهرباء، بالإضافة إلى أجرة البواب في حال وجودها.

        البند السادس عشر:
        في حالة تلف العقار أو أي جزء منه بسبب الطرف الثاني، يجب على الطرف الثاني تصليحه على نفقته واعادته إلى حالته الأصلية.

        البند السابع عشر:
        قاضي الأمور المستعجلة يتخذ اختصاصًا في فض المنازعات المتعلقة بتنفيذ هذا العقد وتطبيقه.

        البند الثامن عشر:
        يتم توقيع هذا العقد في نسختين، حيث تحتفظ كل طرف بنسخة منه.



        
        ..................... :الطرف الأول: .....................       الطرف الثاني  
        `;
    
    }else{
      contractDetails = `
      ${contractType} Agreement
      This agreement is made on ${today} between:

      First Party (Owner):
      Mr./Ms. ${selectedOwner.full_name}, ID No. ${this.contractData.owner_id_number}, residing at ${this.contractData.owner_address}, the rightful owner of the property located at ${address}.

      Second Party (${contractType === 'Rent' ? 'Tenant' : 'Buyer'}):
      Mr./Ms. ${selectedBuyer.full_name}, ID No. ${this.contractData.buyer_id_number}, residing at ${this.contractData.buyer_address}, interested in ${contractType === 'Rent' ? 'renting' : 'purchasing'} the unit number ${unitNumber}.

      Clause 3:
      ${contractType === 'Rent' ? `The agreed monthly rent is ${rentAmount} EGP.` : `The agreed sale price is ${rentAmount} EGP.`}

      Clause 4:
      The contract starts on the signature date and ends on ${dueDate.toDateString}.
      ...
      `;
    }

    // this.contractData.contract_details = contractDetails;
    this.contractData.contract_details = contractDetails.replace(/\n/g, '<br>');

    this.http.post('http://localhost:5000/contracts', this.contractData).subscribe({
      next: () => {
        alert('Contract created successfully!');
        this.router.navigate(['/owner-dashboard/admin-contracts']);
      },
      error: (err) => {
        console.error('Error creating contract:', err);
        alert('Failed to create contract.');
      }
    });
  }
  
}
