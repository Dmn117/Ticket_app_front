import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Message, Ticket } from 'src/app/shared/models/ticket';
import { AuthService } from 'src/app/core/services/auth.service';
import { FileService } from 'src/app/core/services/file.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { MessageService } from 'src/app/core/services/message.service';
import { MessageCreate, ResMessageCreate } from 'src/app/shared/models/message';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TicketStatus, TicketStatusEn } from 'src/app/shared/enums/ticketStatus';
import { AssignedTicketComponent } from '../assigned-ticket/assigned-ticket.component';
import { TransferTicketComponent } from '../transfer-ticket/transfer-ticket.component';
import { ChangeTicketStatusComponent } from '../change-ticket-status/change-ticket-status.component';
import { Roles } from 'src/app/shared/models/roles';
import { SocketWebService } from 'src/app/core/services/socket-web.service';
import SocketEvents from 'src/app/shared/enums/Socket.events';
import { MessageAttachmentType, MessageVisibility, MessageVisibilityIcons } from 'src/app/shared/enums/message';
import { RateTicketComponent } from '../rate-ticket/rate-ticket.component';
import { RatingClass, RatingLimit } from 'src/app/shared/enums/ratingClass';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ViewImageComponent } from '../view-image/view-image.component';
import { HttpErrorResponse } from '@angular/common/http';
import formatLocalDate, { dateType } from 'src/app/shared/lib/FormatLocalDate';
import MinutesToString, { SecondsToString } from 'src/app/shared/lib/MinutesToString';
import { HelpTopic } from 'src/app/shared/models/helpTopic';

@Component({
  selector: 'app-view-ticket',
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.scss'],
})

export class ViewTicketComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  private subscription: Subscription = new Subscription();
  private sendMessageObserver: ResizeObserver | null = null;

  userRol: string = this._authService.getRol() || 'USER';
  userId: string = this._authService.getId() || '';
  ticket: Ticket | null = null;
  messages: Message[] = [];
  messageFile: File | null = null;
  userDepartments: string[] = this._authService.getDepartments();
  ticketId: string = this._activatedrouter.snapshot.paramMap.get('id') || '';
  statusEn = TicketStatusEn;
  status = TicketStatus;
  loaded: boolean = false;
  mediaUrl: string = '';
  roles = Roles;
  prevMessages: number = this.ticket?.messages.length || 0;
  messageVisibility: string = MessageVisibility.TO_ALL;
  messageVisibilities = MessageVisibility;
  messageVisibilityIcons = MessageVisibilityIcons;


  expandedMessages: Set<string> = new Set();
  maxLength: number = 100;
  emailPattern: RegExp = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  urlPattern: RegExp = /(https?:\/\/[^\s]+)/g;
  updatedText: any = " ";

  minutes2String = MinutesToString;
  seconds2String = SecondsToString;

  isMyTicket: boolean = false;
  unassignedOrAdmin: boolean = false;
  visiblePanel: boolean = false;
  isAdmin: boolean = false;
  openRate: boolean = false;
  notUser: boolean = false;

  initObserver: boolean = false;
  originalSendMessageHeight: number = 0;

  isImage: boolean = false;
  isVideo: boolean = false;
  isOther: boolean = false;
  isPdf: boolean = false;
  isText: boolean = false;
  previewUrl: SafeResourceUrl | string | null = null;
  previewText: string | null = null;

  messageAttachmentType = MessageAttachmentType;
  fileViewerHighPercent: number = 60;

  dateTypeL = dateType;
  formatLocalDateL = formatLocalDate;

  counter: number = 0;
  intervalId: any;

  formMessage: UntypedFormGroup = new UntypedFormGroup({
    message: new UntypedFormControl('', Validators.required),
  });

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('sendMessageContainer') private sendMessageContainer!: ElementRef;
  @ViewChild('fileViewer') private fileViewer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private _dialog: MatDialog,
    private _renderer: Renderer2,
    private _sanitizer: DomSanitizer,
    private _fileService: FileService,
    private _authService: AuthService,
    private _ticketService: TicketService,
    private _messageService: MessageService,
    private _activatedrouter: ActivatedRoute,
    private _socketWebService: SocketWebService,
  ) { }

  ngOnInit(): void {
    this.loadTicket();
    this._socketWebService.emitEvent(SocketEvents.TicketJoin, {
      ticket: this.ticketId,
    });
  }

  ngAfterViewInit(): void {
    this.listenSocket();
  }

  ngAfterViewChecked(): void {
    if (this.messages) {
      if (this.messages.length !== this.prevMessages) {
        this.scrollDown();
        this.prevMessages = this.messages.length;
      }
    }

    if (this.sendMessageContainer && !this.initObserver && this.fileViewer) {
      this.initHtmlObserver();
    }
  }

  listenSocket = (): void => {
    this.subscription.add(
      this._socketWebService
        .listenEvent<any>(SocketEvents.TicketChange)
        .subscribe((res) => {
          console.log('Cambio en Ticket: ', res.text);
          this.loadTicket();
        })
    );
  };


  stopCounter = (): void => {
    this.counter = 0;
    this.loadTicket();
    clearInterval(this.intervalId);
  };


  startCounter = (assignedAt: Date | null, expIn: number | null): void => {
    if (this.intervalId) clearInterval(this.intervalId);

    const current = new Date().getTime();
    const initial = new Date(assignedAt || 0).getTime();
    const expirationTime = initial + ((expIn || 0) * 60 * 1000);
    const remaining = (expirationTime - current) / 1000 - (expIn || 0);

    this.counter = remaining > 0 ? remaining : 0;

    if (this.counter <= 0) return;

    this.intervalId = setInterval(() => {
      if (this.counter > 0) {
        this.counter--;
      }
      else {
        this.stopCounter();
      }
    }, 1000);
  };


  initHtmlObserver = (): void => {
    this.originalSendMessageHeight = this.sendMessageContainer.nativeElement.parentElement.offsetHeight;

    this.sendMessageObserver = new ResizeObserver(() => {
      const height = this.sendMessageContainer.nativeElement.offsetHeight;
      const parentHeight = this.sendMessageContainer.nativeElement.parentElement.offsetHeight;
      const factor = (parentHeight - this.originalSendMessageHeight) * (this.fileViewerHighPercent / 100);

      this.fileViewer.nativeElement.style.bottom = `calc(${height}px + 1rem)`;
      this.fileViewer.nativeElement.style.height = `calc(${this.fileViewerHighPercent}% - ${factor}px)`;
    });

    this.sendMessageObserver.observe(this.sendMessageContainer.nativeElement);
    this.initObserver = true;
  };


  closeHtmlObserver = (): void => {
    if (this.sendMessageObserver) {
      this.sendMessageObserver.disconnect();
      this.initObserver = false;
    }
  };


  loadFlags = (ticket: Ticket): void => {
    const isTicketOpen = ticket.status !== this.status.CLOSED && ticket.status !== this.status.CANCELED;
    this.notUser = this.userRol !== Roles.USER;
    const isAssigned = this.ticket?.assignedTo;
    const isUserOwner = this.userId === ticket.owner._id;
    const isUserAssigned = this.userId === ticket.assignedTo?._id;
    const isRated = this.ticket?.rating && this.ticket.rating > 0;
    const sameDepartment = this.userDepartments.includes(
      this.ticket?.department._id || ''
    );

    this.isAdmin = this.userRol === Roles.ADMIN;
    this.isMyTicket = isAssigned ? (isUserOwner || isUserAssigned) : isUserOwner;
    this.unassignedOrAdmin = (isTicketOpen && this.isMyTicket) || this.isAdmin;
    this.visiblePanel = (isTicketOpen && this.notUser && sameDepartment) || this.isAdmin;
    this.openRate = (isUserOwner || this.isAdmin) && !isTicketOpen && !isRated;

    this.openRate && this.openRateTicket(ticket);
  };


  filterMessages = (ticket: Ticket): void => {
    this.messages = ticket.messages.filter(message => {
      if (message.visibility === MessageVisibility.TO_AGENTS) {
        return this.userRol !== Roles.USER
      }

      if (message.visibility === MessageVisibility.ONLY_TO_ME) {
        return this.itsMyMessage(message) || this.isAdmin;
      }

      return true;
    });
  };


  loadTicket = async (): Promise<void> => {
    try {
      const res = await firstValueFrom(
        this._ticketService.getTicket(this.ticketId)
      );

      this.ticket = res.ticket;
      this.loadFlags(res.ticket);
      this.filterMessages(res.ticket);

      this.startCounter(res.ticket.assignedAt, res.ticket.helpTopic.expIn);
    }
    catch (error) {
      console.log(error);
      if ((error as HttpErrorResponse).status === 401) {
        this._authService.validateSession();
      }
    }
    finally {
      this.loaded = true;
    }
  };


  trackByMessageId = (index: number, message: Message): string => {
    return message._id;
  }


  sharePage = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket # ${this.ticket?.number}: ${this.ticket?.title}`,
          text: `${this.ticket?.description}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('El navegador no soporta la función de compartir');
    }
  };


  getStatusEn = (status: string): string => {
    return this.statusEn[status as keyof typeof this.statusEn];
  };


  getExpirationStatus = (ticket: Ticket, counter: string): string => {
    let expirationStatus: string = 'Falta asignar';

    // Verificar si el contador está en "00:00"
    if (counter === "00:00") {
      expirationStatus = 'Retrasado';
    } else if (ticket.helpTopic && ticket.helpTopic.expIn && ticket.assignedAt) {
      const dateAsign = new Date(ticket.assignedAt).getTime();
      const dateNow = new Date().getTime();

      const expirationTime = dateAsign + ticket.helpTopic.expIn * 60 * 1000;
      expirationStatus = expirationTime < dateNow ? 'Retrasado' : 'En Tiempo';
    }

    return expirationStatus;
  };

  getExpirationStatusClass(ticket: Ticket, counter: string): string {
    const status = this.getExpirationStatus(ticket, counter);
    switch (status) {
      case 'Retrasado':
        return 'status-red';
      case 'En Tiempo':
        return 'status-green';
      case 'Falta asignar':
      default:
        return 'status-gray';
    }
  }


  getRatingClass = (rating: number): string => {
    const ratingClass = rating <= RatingLimit.LOW
      ? RatingClass.LOW
      : rating > RatingLimit.LOW && rating < RatingLimit.MEDIUM
        ? RatingClass.MEDIUM
        : RatingClass.HIGH;

    return ratingClass;
  };


  itsMyMessage = (message: Message): boolean => {
    return message.owner._id === this.userId;
  };


  ticketOwner = (message: Message): string => {
    return this.itsMyMessage(message) ? 'my-message' : 'other-message';
  };

  fileOwner = (message: Message): string => {
    return this.itsMyMessage(message) ? 'my-file' : 'other-file';
  }

  getVisibilityIcon = (type: string): string => {
    return this.messageVisibilityIcons[
      type as keyof typeof MessageVisibilityIcons
    ] || this.messageVisibilityIcons.DEFAULT;
  };


  selectMessageVisibility = (type: string) => {
    this.messageVisibility = type;
  };

  formatFileName = (name: string, chars: number): string => {
    if (name.length <= chars) return name;

    const nameArray = name.split('.');
    const ext: string = nameArray[nameArray.length - 1];

    return `${name.slice(0, chars - 3)}... .${ext}`;
  };

  formatDecimal = (rating: number): string => {
    return rating.toFixed(1);
  };


  getMediaUrl = (message: Message): string => {
    return this._fileService.getPublicUrl(message.attachment._id);
  };

  downloadFile = async (message: Message): Promise<void> => {
    const blob = await firstValueFrom(
      this._fileService.downloadPublicFile(message.attachment._id)
    );
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.target = '_self';
    link.download = message.attachment.originalName;
    link.click();
  };


  getOpenInputFile = (): boolean => {
    return (
      this.isImage ||
      this.isVideo ||
      this.isText ||
      this.isPdf ||
      this.isOther
    );
  };


  resetFileSelect = (deleteFile: boolean): void => {
    this.isImage = this.isVideo = this.isText = this.isPdf = this.isOther = false;
    this.closeHtmlObserver();

    if (deleteFile) this.messageFile = null;
  };


  onFileSelected = (event: any): void => {
    const file = event.target.files[0];
    if (file) {
      this.messageFile = file as File;
      const reader = new FileReader();

      this.resetFileSelect(false);

      if (file.type.startsWith('image/')) {
        this.isImage = true;
        this.fileViewerHighPercent = 60;
        reader.readAsDataURL(file);
      }
      else if (file.type.startsWith('text/')) {
        this.isText = true;
        this.fileViewerHighPercent = 60;
        reader.readAsText(file);
      }
      else if (file.type.startsWith('video/')) {
        this.isVideo = true;
        this.fileViewerHighPercent = 60;
        reader.readAsDataURL(file);
      }
      else if (file.type === 'application/pdf') {
        this.isPdf = true;
        this.fileViewerHighPercent = 60;
        reader.readAsDataURL(file);
      }
      else {
        this.isOther = true;
        this.fileViewerHighPercent = 20;
        reader.readAsDataURL(file);
      }

      reader.onload = () => {
        if (this.isText) {
          this.previewText = reader.result as string;
        }
        else {
          this.previewUrl = this._sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
        }
      };
    }
  };


  triggerFileInput = (): void => {
    document.getElementById('fileInput')?.click();
  };


  onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      this.sendMessage(event);
    }
  };


  scrollDown = (): void => {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (error) {
      console.error('Error al desplazar el scroll:', error);
    }
  };


  changeVisibility = async (id: string, visibility: string): Promise<void> => {
    try {
      const res = await firstValueFrom(
        this._messageService.updateMessage(id, { visibility })
      );

      this._socketWebService.emitEvent(SocketEvents.TicketChange, {
        text: `Mensaje actualizado: ${res.message.owner}`,
        ticket: this.ticketId,
      });

      this.loadTicket();
    }
    catch (error) {
      console.log(error);
    }
  };


  getMessageFileType = (): string => {
    if (this.isImage)
      return MessageAttachmentType.IMAGE;
    if (this.isVideo)
      return MessageAttachmentType.VIDEO;
    if (this.isText)
      return MessageAttachmentType.TEXT;
    if (this.isPdf)
      return MessageAttachmentType.PDF;
    else
      return MessageAttachmentType.OTHER;
  };


  sendMessage = async (event: KeyboardEvent): Promise<void> => {
    try {
      event.preventDefault();
  
      if (this.formMessage.invalid) return;
  
      const message: Partial<MessageCreate> = {
        text: this.formMessage.value.message,
        owner: this.userId,
        visibility: this.messageVisibility
      };
  
      this.formMessage.reset();
      this.messageVisibility = MessageVisibility.TO_ALL;
  
      if (this.messageFile && this.ticket) {
        const res = await firstValueFrom(
          this._fileService.createAvatarFile(this.userId, this.ticket._id, this.messageFile)
        );
  
        message.attachment = res.file._id;
        message.attachmentType = this.getMessageFileType();
  
        this.resetFileSelect(true);
      }
  
      const res: ResMessageCreate = await firstValueFrom(
        this._messageService.createMessage(message)
      );
  
      const addItem = await firstValueFrom(
        this._ticketService.addItemTicket(this.ticket?._id || '', {
          message: res.message._id,
        })
      );
  
      const expandedMessageIds = new Set(this.expandedMessages);
  
      this._socketWebService.emitEvent(SocketEvents.TicketChange, {
        message: res.message,
        ticket: {
          _id: this.ticketId,
          number: this.ticket?.number,
          title: this.ticket?.title
        },
      });
  
      await this.loadTicket();
  
      this.expandedMessages = expandedMessageIds;
    } catch (error) {
      console.log(error);
    }
  };
  


  openAssignedAgent = (ticket: Ticket): void => {
    this._dialog.open(AssignedTicketComponent, {
      width: '25vw',
      data: {
        ticket,
        loadTicket: () => this.loadTicket(),
      },
    });
  };


  openTransferTicket = (ticket: Ticket): void => {
    this._dialog.open(TransferTicketComponent, {
      width: '25vw',
      data: {
        ticket,
        loadTicket: () => this.loadTicket(),
      },
    });
  };


  openChangeStatus = (ticket: Ticket): void => {
    this._dialog.open(ChangeTicketStatusComponent, {
      width: '20vw',
      data: {
        ticket,
        loadTicket: () => this.loadTicket(),
      },
    });
  };


  openRateTicket = (ticket: Ticket): void => {
    this._dialog.open(RateTicketComponent, {
      width: '40vw',
      data: {
        ticket,
        loadTicket: () => this.loadTicket(),
      },
    });
  };


  openViewImage = (url: string | SafeResourceUrl | null): void => {
    this._dialog.open(ViewImageComponent, {
      data: url
    });
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    if (
      this.userId !== this.ticket?.owner._id &&
      this.userId !== this.ticket?.assignedTo?._id
    ) {
      this._socketWebService.emitEvent(SocketEvents.TicketLeave, {
        ticket: this.ticketId,
      });
    }

    this.closeHtmlObserver();
    this.stopCounter();
  };

  convertToLinks(text: string): string {
    let updatedText = text;

    updatedText = updatedText.replace(this.emailPattern, (email: string) => {
      return `<a href="mailto:${email}">${email}</a>`;
    });

    updatedText = updatedText.replace(this.urlPattern, (url: string) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return updatedText;
  }

  isMessageExpanded(message: any): boolean {
    return this.expandedMessages.has(message._id);
  }

  getTruncatedText(message: any): SafeHtml {
    let isExpanded = this.isMessageExpanded(message);
    let textToConvert = isExpanded || message.text.length <= this.maxLength
      ? message.text
      : message.text.slice(0, this.maxLength) + '...';

    let convertedText: string = this.convertToLinks(textToConvert);

    return this._sanitizer.bypassSecurityTrustHtml(convertedText);
  }


  toggleExpand(message: any): void {
    if (this.isMessageExpanded(message)) {
      this.expandedMessages.delete(message._id);
    } else {
      this.expandedMessages.add(message._id);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    const files = Array.from(items).map(item => item.getAsFile()).filter(f => f) as File[];
    files.forEach(file => this.handleFile(file));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => this.handleFile(file));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Necesario para permitir drop
  }

  onFileSelectedInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      Array.from(input.files).forEach(file => this.handleFile(file));
      input.value = ''; // Reiniciar el input por si el usuario sube el mismo archivo otra vez
    }
  }

  handleFile(file: File): void {
    this.messageFile = file;

    const fakeEvent = {
      target: { files: [file] }
    } as unknown as Event;

    this.onFileSelected(fakeEvent);
  }


}
