export interface Translations {
  headerTitle: string;
  headerSubtitle: string;
  headerNewTask: string;
  headerToggleTheme: string;
  headerToggleLanguage: string;
  headerSignOut: string;
  headerOpenProfile: string;
  headerGreeting: (name: string) => string;

  profileTitle: string;
  profileAvatarChange: string;
  profileAvatarRemove: string;
  profileNameLabel: string;
  profileNamePlaceholder: string;
  profileSaveProfile: string;
  profileProfileSaved: string;
  profileEmailSectionTitle: string;
  profileCurrentEmailLabel: string;
  profileNewEmailLabel: string;
  profileCurrentPasswordLabel: string;
  profileChangeEmail: string;
  profileEmailChanged: string;
  profilePasswordSectionTitle: string;
  profileNewPasswordLabel: string;
  profileConfirmPasswordLabel: string;
  profileChangePassword: string;
  profilePasswordChanged: string;
  profileErrorIncorrectPassword: string;
  profileErrorEmailTaken: string;
  profileErrorPasswordMismatch: string;
  profileErrorInvalidInput: string;
  profileErrorUnknown: string;

  authSubtitle: string;
  authEmail: string;
  authPassword: string;
  authConfirmPassword: string;
  authShowPassword: string;
  authHidePassword: string;
  authSignInTab: string;
  authSignUpTab: string;
  authSubmitSignIn: string;
  authSubmitSignUp: string;
  authErrorInvalidInput: string;
  authErrorEmailTaken: string;
  authErrorInvalidCredentials: string;
  authErrorPasswordMismatch: string;
  authErrorUnknown: string;
  authLoadingCloudData: string;
  authImportLocalTitle: string;
  authImportLocalBody: string;
  authImportLocalButton: string;
  authImportLocalSkip: string;
  authSignUpSuccess: string;

  sidebarCategories: string;
  sidebarManageCategories: string;
  sidebarAll: string;
  sidebarPriorities: string;
  sidebarPrioritiesHint: string;

  modalClose: string;
  carouselPrev: string;
  carouselNext: string;

  taskGridEmpty: string;

  taskCardRemoveFromPriorities: string;
  taskCardMarkAsPriority: string;
  taskCardEdit: string;
  taskCardDelete: string;

  taskFormEditTitle: string;
  taskFormNewTitle: string;
  taskFormTitleLabel: string;
  taskFormTitlePlaceholder: string;
  taskFormNotesLabel: string;
  taskFormCategoriesLabel: string;
  taskFormNoCategories: string;
  taskFormClientLabel: string;
  taskFormManageClients: string;
  taskFormNoClient: string;
  taskFormDueDateLabel: string;
  taskFormTimeLabel: string;
  taskFormTimeCaptionLabel: string;
  taskFormTimeCaptionPlaceholder: string;
  taskFormRecurrenceLabel: string;
  taskFormMarkedAsPriority: string;
  taskFormMarkAsPriority: string;
  taskFormCancel: string;
  taskFormSave: string;
  taskFormCreate: string;

  categoryManage: string;
  categoryRemove: string;
  categoryNewLabel: string;
  categoryNamePlaceholder: string;
  categoryColorAria: string;
  categoryConfirmRemove: (count: number) => string;
  categoryMoveUp: string;
  categoryMoveDown: string;

  clientManage: string;
  clientEmpty: string;
  clientRemove: string;
  clientNamePlaceholder: string;
  clientConfirmRemove: (count: number) => string;

  commonAdd: string;

  attachmentsLabel: string;
  attachmentsUpload: string;
  attachmentsRemove: string;
  attachmentTooLarge: (name: string) => string;

  footerSearchPlaceholder: string;
  footerSearch: string;

  timerStop: string;
  timerPause: string;
  timerStart: string;
  timerReset: string;
  timerSettings: string;
  timerReasonPlaceholder: string;
  timerMinutes: string;
  timerSeconds: string;
  timerApply: string;
  timerNotificationTitle: string;
  timerNotificationBody: string;

  alarmAddEmpty: string;
  alarmStop: string;
  alarmActive: string;
  alarmSettings: string;
  alarmAdd: string;
  alarmRemove: string;
  alarmReasonPlaceholder: string;
  alarmNotificationTitle: string;
  alarmNotificationBody: (time: string) => string;

  weatherAddCity: string;
  weatherLoading: string;
  weatherError: string;
  weatherAddCityAria: string;
  weatherRemoveCityAria: string;
  weatherCityPlaceholder: string;
  weatherSearch: string;
  weatherAutoDetectedFallback: string;
  weatherFallbackDescription: string;
  weatherCodes: Record<number, string>;
  weatherViewToday: string;
  weatherViewWeek: string;

  recurrenceNone: string;
  recurrenceDaily: string;
  recurrenceWeekly: string;
  recurrenceMonthly: string;

  taskDateCompleted: string;
  taskDateOverdue: (days: number) => string;
  taskDateDueToday: string;
  taskDateDueTomorrow: string;
  taskDateDueInDays: (days: number) => string;
  taskDateAtTime: (time: string) => string;

  soundClassic: string;
  soundGentle: string;
  soundAlert: string;
  soundDigital: string;
  soundBell: string;

  defaultCategoryArticles: string;
  defaultCategoryGbp: string;
  defaultCategoryFinance: string;
}

const weatherCodesPt: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Poucas nuvens',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa forte',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas de chuva',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo',
  99: 'Tempestade forte com granizo',
};

const weatherCodesEn: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Freezing fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Heavy rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail',
};

export const translations: Record<'pt' | 'en', Translations> = {
  pt: {
    headerTitle: 'Shinobi Labs Task Reminder',
    headerSubtitle: 'Suas tarefas de trabalho, organizadas por prazo',
    headerNewTask: 'Nova tarefa',
    headerToggleTheme: 'Alternar tema',
    headerToggleLanguage: 'Mudar idioma',
    headerSignOut: 'Sair',
    headerOpenProfile: 'Meu perfil',
    headerGreeting: (name) => `Olá, ${name}`,

    profileTitle: 'Meu perfil',
    profileAvatarChange: 'Alterar foto',
    profileAvatarRemove: 'Remover foto',
    profileNameLabel: 'Nome completo',
    profileNamePlaceholder: 'Seu nome completo',
    profileSaveProfile: 'Salvar perfil',
    profileProfileSaved: 'Perfil atualizado.',
    profileEmailSectionTitle: 'E-mail',
    profileCurrentEmailLabel: 'E-mail atual',
    profileNewEmailLabel: 'Novo e-mail',
    profileCurrentPasswordLabel: 'Senha atual',
    profileChangeEmail: 'Salvar e-mail',
    profileEmailChanged: 'E-mail atualizado.',
    profilePasswordSectionTitle: 'Senha',
    profileNewPasswordLabel: 'Nova senha',
    profileConfirmPasswordLabel: 'Confirmar nova senha',
    profileChangePassword: 'Salvar senha',
    profilePasswordChanged: 'Senha atualizada.',
    profileErrorIncorrectPassword: 'Senha atual incorreta.',
    profileErrorEmailTaken: 'Este e-mail já está cadastrado.',
    profileErrorPasswordMismatch: 'As senhas não coincidem.',
    profileErrorInvalidInput: 'Preencha todos os campos (senha com no mínimo 6 caracteres).',
    profileErrorUnknown: 'Não foi possível salvar. Tente novamente.',

    authSubtitle: 'Suas tarefas em qualquer navegador ou dispositivo',
    authEmail: 'E-mail',
    authPassword: 'Senha',
    authConfirmPassword: 'Confirmar senha',
    authShowPassword: 'Mostrar senha',
    authHidePassword: 'Ocultar senha',
    authSignInTab: 'Entrar',
    authSignUpTab: 'Criar conta',
    authSubmitSignIn: 'Entrar',
    authSubmitSignUp: 'Criar conta',
    authErrorInvalidInput: 'Preencha e-mail e senha (mínimo 6 caracteres).',
    authErrorEmailTaken: 'Este e-mail já está cadastrado.',
    authErrorInvalidCredentials: 'E-mail ou senha incorretos.',
    authErrorPasswordMismatch: 'As senhas não coincidem.',
    authErrorUnknown: 'Não foi possível conectar. Tente novamente.',
    authLoadingCloudData: 'Carregando suas tarefas…',
    authImportLocalTitle: 'Encontramos tarefas salvas neste navegador',
    authImportLocalBody: 'Quer importar essas tarefas para sua conta agora?',
    authImportLocalButton: 'Importar para minha conta',
    authImportLocalSkip: 'Não importar',
    authSignUpSuccess: 'Conta criada com sucesso! Bem-vindo(a).',

    sidebarCategories: 'Categorias',
    sidebarManageCategories: 'Gerenciar categorias',
    sidebarAll: 'Todas',
    sidebarPriorities: 'Prioridades',
    sidebarPrioritiesHint: 'Marque uma tarefa com a estrela para adicioná-la aqui',

    modalClose: 'Fechar',
    carouselPrev: 'Anterior',
    carouselNext: 'Próximo',

    taskGridEmpty: 'Nenhuma tarefa por aqui. Clique em "Nova tarefa" para começar.',

    taskCardRemoveFromPriorities: 'Remover de Prioridades',
    taskCardMarkAsPriority: 'Marcar como prioridade',
    taskCardEdit: 'Editar tarefa',
    taskCardDelete: 'Excluir tarefa',

    taskFormEditTitle: 'Editar tarefa',
    taskFormNewTitle: 'Nova tarefa',
    taskFormTitleLabel: 'Título',
    taskFormTitlePlaceholder: 'Ex: Criar artigos para Empresa X',
    taskFormNotesLabel: 'Notas (opcional)',
    taskFormCategoriesLabel: 'Categorias (pode escolher mais de uma)',
    taskFormNoCategories: 'Nenhuma categoria cadastrada.',
    taskFormClientLabel: 'Cliente',
    taskFormManageClients: 'Gerenciar clientes',
    taskFormNoClient: 'Sem cliente',
    taskFormDueDateLabel: 'Data de vencimento',
    taskFormTimeLabel: 'Horário (opcional)',
    taskFormTimeCaptionLabel: 'Legenda do horário (opcional)',
    taskFormTimeCaptionPlaceholder: 'Ex: Entrega do projeto',
    taskFormRecurrenceLabel: 'Recorrência',
    taskFormMarkedAsPriority: 'Marcada como prioridade',
    taskFormMarkAsPriority: 'Marcar como prioridade',
    taskFormCancel: 'Cancelar',
    taskFormSave: 'Salvar',
    taskFormCreate: 'Criar tarefa',

    categoryManage: 'Gerenciar categorias',
    categoryRemove: 'Remover categoria',
    categoryNewLabel: 'Nova categoria',
    categoryNamePlaceholder: 'Nome da categoria',
    categoryColorAria: 'Cor',
    categoryConfirmRemove: (count) =>
      `Esta categoria tem ${count} tarefa(s). Elas ficarão sem categoria. Continuar?`,
    categoryMoveUp: 'Mover para cima',
    categoryMoveDown: 'Mover para baixo',

    clientManage: 'Gerenciar clientes',
    clientEmpty: 'Nenhum cliente cadastrado ainda.',
    clientRemove: 'Remover cliente',
    clientNamePlaceholder: 'Nome do cliente',
    clientConfirmRemove: (count) =>
      `Este cliente tem ${count} tarefa(s). Elas ficarão sem cliente. Continuar?`,

    commonAdd: 'Adicionar',

    attachmentsLabel: 'Anexos (imagens ou arquivos, opcional)',
    attachmentsUpload: 'Enviar arquivos',
    attachmentsRemove: 'Remover anexo',
    attachmentTooLarge: (name) => `"${name}" é maior que 3MB e não foi anexado.`,

    footerSearchPlaceholder: 'Pesquisar no Google…',
    footerSearch: 'Pesquisar',

    timerStop: 'Parar',
    timerPause: 'Pausar timer',
    timerStart: 'Iniciar timer',
    timerReset: 'Reiniciar timer',
    timerSettings: 'Configurar timer',
    timerReasonPlaceholder: 'Motivo (opcional)',
    timerMinutes: 'min',
    timerSeconds: 'seg',
    timerApply: 'Definir',
    timerNotificationTitle: 'Timer finalizado',
    timerNotificationBody: 'O tempo configurado chegou ao fim.',

    alarmAddEmpty: 'Adicionar alarme',
    alarmStop: 'Parar',
    alarmActive: 'Ativo',
    alarmSettings: 'Configurar alarme',
    alarmAdd: 'Adicionar alarme',
    alarmRemove: 'Remover alarme',
    alarmReasonPlaceholder: 'Motivo (opcional)',
    alarmNotificationTitle: 'Alarme',
    alarmNotificationBody: (time) => `Alarme das ${time}`,

    weatherAddCity: 'Adicionar cidade para ver o clima',
    weatherLoading: 'Carregando…',
    weatherError: 'Não foi possível carregar o clima',
    weatherAddCityAria: 'Adicionar cidade',
    weatherRemoveCityAria: 'Remover cidade',
    weatherCityPlaceholder: 'Nome da cidade',
    weatherSearch: 'Buscar',
    weatherAutoDetectedFallback: 'Minha localização',
    weatherFallbackDescription: 'Tempo estável',
    weatherCodes: weatherCodesPt,
    weatherViewToday: 'Hoje',
    weatherViewWeek: 'Semana',

    recurrenceNone: 'Não repete',
    recurrenceDaily: 'Diária',
    recurrenceWeekly: 'Semanal',
    recurrenceMonthly: 'Mensal',

    taskDateCompleted: 'Concluída',
    taskDateOverdue: (days) => `Atrasada há ${days} dia${days === 1 ? '' : 's'}`,
    taskDateDueToday: 'Vence hoje',
    taskDateDueTomorrow: 'Vence amanhã',
    taskDateDueInDays: (days) => `Vence em ${days} dias`,
    taskDateAtTime: (time) => `até às ${time}`,

    soundClassic: 'Clássico',
    soundGentle: 'Suave',
    soundAlert: 'Alerta',
    soundDigital: 'Digital',
    soundBell: 'Sino',

    defaultCategoryArticles: 'Artigos',
    defaultCategoryGbp: 'GBP',
    defaultCategoryFinance: 'Financeiro',
  },
  en: {
    headerTitle: 'Shinobi Labs Task Reminder',
    headerSubtitle: 'Your work tasks, organized by deadline',
    headerNewTask: 'New task',
    headerToggleTheme: 'Toggle theme',
    headerToggleLanguage: 'Switch language',
    headerSignOut: 'Sign out',
    headerOpenProfile: 'My profile',
    headerGreeting: (name) => `Hi, ${name}`,

    profileTitle: 'My profile',
    profileAvatarChange: 'Change photo',
    profileAvatarRemove: 'Remove photo',
    profileNameLabel: 'Full name',
    profileNamePlaceholder: 'Your full name',
    profileSaveProfile: 'Save profile',
    profileProfileSaved: 'Profile updated.',
    profileEmailSectionTitle: 'Email',
    profileCurrentEmailLabel: 'Current email',
    profileNewEmailLabel: 'New email',
    profileCurrentPasswordLabel: 'Current password',
    profileChangeEmail: 'Save email',
    profileEmailChanged: 'Email updated.',
    profilePasswordSectionTitle: 'Password',
    profileNewPasswordLabel: 'New password',
    profileConfirmPasswordLabel: 'Confirm new password',
    profileChangePassword: 'Save password',
    profilePasswordChanged: 'Password updated.',
    profileErrorIncorrectPassword: 'Incorrect current password.',
    profileErrorEmailTaken: 'This email is already registered.',
    profileErrorPasswordMismatch: "Passwords don't match.",
    profileErrorInvalidInput: 'Fill in all fields (password must be at least 6 characters).',
    profileErrorUnknown: 'Could not save. Please try again.',

    authSubtitle: 'Your tasks on any browser or device',
    authEmail: 'Email',
    authPassword: 'Password',
    authConfirmPassword: 'Confirm password',
    authShowPassword: 'Show password',
    authHidePassword: 'Hide password',
    authSignInTab: 'Sign in',
    authSignUpTab: 'Create account',
    authSubmitSignIn: 'Sign in',
    authSubmitSignUp: 'Create account',
    authErrorInvalidInput: 'Fill in email and password (minimum 6 characters).',
    authErrorEmailTaken: 'This email is already registered.',
    authErrorInvalidCredentials: 'Incorrect email or password.',
    authErrorPasswordMismatch: "Passwords don't match.",
    authErrorUnknown: 'Could not connect. Please try again.',
    authLoadingCloudData: 'Loading your tasks…',
    authImportLocalTitle: 'We found tasks saved on this browser',
    authImportLocalBody: 'Want to import those tasks into your account now?',
    authImportLocalButton: 'Import into my account',
    authImportLocalSkip: "Don't import",
    authSignUpSuccess: 'Account created successfully! Welcome.',

    sidebarCategories: 'Categories',
    sidebarManageCategories: 'Manage categories',
    sidebarAll: 'All',
    sidebarPriorities: 'Priorities',
    sidebarPrioritiesHint: 'Star a task to add it here',

    modalClose: 'Close',
    carouselPrev: 'Previous',
    carouselNext: 'Next',

    taskGridEmpty: 'No tasks yet. Click "New task" to get started.',

    taskCardRemoveFromPriorities: 'Remove from Priorities',
    taskCardMarkAsPriority: 'Mark as priority',
    taskCardEdit: 'Edit task',
    taskCardDelete: 'Delete task',

    taskFormEditTitle: 'Edit task',
    taskFormNewTitle: 'New task',
    taskFormTitleLabel: 'Title',
    taskFormTitlePlaceholder: 'E.g.: Write articles for Company X',
    taskFormNotesLabel: 'Notes (optional)',
    taskFormCategoriesLabel: 'Categories (choose as many as you like)',
    taskFormNoCategories: 'No categories yet.',
    taskFormClientLabel: 'Client',
    taskFormManageClients: 'Manage clients',
    taskFormNoClient: 'No client',
    taskFormDueDateLabel: 'Due date',
    taskFormTimeLabel: 'Time (optional)',
    taskFormTimeCaptionLabel: 'Time caption (optional)',
    taskFormTimeCaptionPlaceholder: 'E.g.: Project delivery',
    taskFormRecurrenceLabel: 'Recurrence',
    taskFormMarkedAsPriority: 'Marked as priority',
    taskFormMarkAsPriority: 'Mark as priority',
    taskFormCancel: 'Cancel',
    taskFormSave: 'Save',
    taskFormCreate: 'Create task',

    categoryManage: 'Manage categories',
    categoryRemove: 'Remove category',
    categoryNewLabel: 'New category',
    categoryNamePlaceholder: 'Category name',
    categoryColorAria: 'Color',
    categoryConfirmRemove: (count) =>
      `This category has ${count} task(s). They will become uncategorized. Continue?`,
    categoryMoveUp: 'Move up',
    categoryMoveDown: 'Move down',

    clientManage: 'Manage clients',
    clientEmpty: 'No clients yet.',
    clientRemove: 'Remove client',
    clientNamePlaceholder: 'Client name',
    clientConfirmRemove: (count) =>
      `This client has ${count} task(s). They will become clientless. Continue?`,

    commonAdd: 'Add',

    attachmentsLabel: 'Attachments (images or files, optional)',
    attachmentsUpload: 'Upload files',
    attachmentsRemove: 'Remove attachment',
    attachmentTooLarge: (name) => `"${name}" is larger than 3MB and was not attached.`,

    footerSearchPlaceholder: 'Search Google…',
    footerSearch: 'Search',

    timerStop: 'Stop',
    timerPause: 'Pause timer',
    timerStart: 'Start timer',
    timerReset: 'Reset timer',
    timerSettings: 'Configure timer',
    timerReasonPlaceholder: 'Reason (optional)',
    timerMinutes: 'min',
    timerSeconds: 'sec',
    timerApply: 'Set',
    timerNotificationTitle: 'Timer finished',
    timerNotificationBody: 'The configured time has run out.',

    alarmAddEmpty: 'Add alarm',
    alarmStop: 'Stop',
    alarmActive: 'Active',
    alarmSettings: 'Configure alarm',
    alarmAdd: 'Add alarm',
    alarmRemove: 'Remove alarm',
    alarmReasonPlaceholder: 'Reason (optional)',
    alarmNotificationTitle: 'Alarm',
    alarmNotificationBody: (time) => `Alarm for ${time}`,

    weatherAddCity: 'Add a city to see the weather',
    weatherLoading: 'Loading…',
    weatherError: 'Could not load the weather',
    weatherAddCityAria: 'Add city',
    weatherRemoveCityAria: 'Remove city',
    weatherCityPlaceholder: 'City name',
    weatherSearch: 'Search',
    weatherAutoDetectedFallback: 'My location',
    weatherFallbackDescription: 'Stable weather',
    weatherCodes: weatherCodesEn,
    weatherViewToday: 'Today',
    weatherViewWeek: 'Week',

    recurrenceNone: "Doesn't repeat",
    recurrenceDaily: 'Daily',
    recurrenceWeekly: 'Weekly',
    recurrenceMonthly: 'Monthly',

    taskDateCompleted: 'Completed',
    taskDateOverdue: (days) => `${days} day${days === 1 ? '' : 's'} overdue`,
    taskDateDueToday: 'Due today',
    taskDateDueTomorrow: 'Due tomorrow',
    taskDateDueInDays: (days) => `Due in ${days} days`,
    taskDateAtTime: (time) => `by ${time}`,

    soundClassic: 'Classic',
    soundGentle: 'Gentle',
    soundAlert: 'Alert',
    soundDigital: 'Digital',
    soundBell: 'Bell',

    defaultCategoryArticles: 'Articles',
    defaultCategoryGbp: 'GBP',
    defaultCategoryFinance: 'Finance',
  },
};
