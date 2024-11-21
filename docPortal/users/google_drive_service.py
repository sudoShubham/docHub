from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io
from rest_framework.response import Response

from googleapiclient.http import MediaInMemoryUpload, MediaFileUpload



# Initialize the Google Drive service
def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        '/Users/shubham/Desktop/DocHub/docHub/lively-tensor-441706-h2-d8c7c64a6f3c.json', scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)

def get_or_create_folder(service, parent_folder_id, folder_name):
    """Find a folder inside the parent folder by its name or create it if it doesn't exist."""
    query = f"'{parent_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '{folder_name}'"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    folders = results.get('files', [])

    if folders:
        return folders[0]['id']  # Return the ID of the first matching folder
    else:
        return create_folder(service, parent_folder_id, folder_name)

# Create a folder in Google Drive
def create_folder(service, parent_folder_id, folder_name):
    """Creates a new folder inside the specified parent folder."""
    file_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parent_folder_id]  # Make it a subfolder of the parent folder
    }
    folder = service.files().create(body=file_metadata, fields='id').execute()
    return folder.get('id')

# Create a user folder and set metadata inside the Waynautic folder
def create_user_folder(service, parent_folder_id, user_name, user_email):
    """Create a user folder inside the Waynautic folder and set metadata."""
    folder_name = f"{user_name}_{user_email}"
    
    # Check if the folder already exists inside the parent folder
    folder_id = get_or_create_folder(service, parent_folder_id, folder_name)
    if folder_id:
        print(f"Folder already exists for user: {user_name} ({user_email})")
        return folder_id  # Return the existing folder ID

    # If the folder doesn't exist, create a new one
    file_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parent_folder_id],
        'description': f"User folder for {user_name} ({user_email})",  # Add metadata for differentiation
        'properties': {'user_email': user_email}  # Optional: Store the email in the properties for later retrieval
    }
    folder = service.files().create(body=file_metadata, fields='id').execute()
    print(f"Folder created for user: {user_name} ({user_email})")
    return folder.get('id')




def share_folder_with_email(service, folder_id, email):
    """Share a folder with a specific email."""
    try:
        # Define the permission for the folder
        permission = {
            'type': 'user',
            'role': 'reader',  # You can change 'reader' to 'writer' if needed
            'emailAddress': email,
        }

        # Share the folder by adding the permission
        service.permissions().create(
            fileId=folder_id,
            body=permission,
            sendNotificationEmail=True  # Set to False if no email notification is needed
        ).execute()

        print(f"Folder shared successfully with {email}")
    except Exception as e:
        print(f"Error sharing folder with {email}: {str(e)}")

def upload_file_with_versioning(service, folder_id, file):
    original_filename = file.name
    file_basename, file_extension = original_filename.rsplit('.', 1) if '.' in original_filename else (original_filename, '')

    # Check for existing files with the same base name
    query = f"'{folder_id}' in parents and name contains '{file_basename}' and trashed=false"
    existing_files = service.files().list(q=query, fields="files(name)").execute().get('files', [])

    # Determine the next version number
    version = 1
    for existing_file in existing_files:
        existing_name = existing_file['name']
        if existing_name.startswith(file_basename) and 'v' in existing_name:
            try:
                existing_version = int(existing_name.split('v')[-1].split('.')[0])
                version = max(version, existing_version + 1)
            except ValueError:
                continue

    # Set new filename with version number
    new_filename = f"{file_basename}_v{version}.{file_extension}" if file_extension else f"{file_basename}_v{version}"

    file_metadata = {
        'name': new_filename,
        'parents': [folder_id]
    }

    # Check file type and set up media upload accordingly
    if hasattr(file, 'temporary_file_path'):
        # Use MediaFileUpload for files stored temporarily
        media = MediaFileUpload(file.temporary_file_path(), mimetype=file.content_type)
    else:
        # Use MediaInMemoryUpload for in-memory files
        media = MediaInMemoryUpload(file.read(), mimetype=file.content_type)

    uploaded_file = service.files().create(body=file_metadata, media_body=media, fields="id, webViewLink").execute()

    file_info = {
        'file_id': uploaded_file.get('id'),
        'webViewLink': uploaded_file.get('webViewLink')
    }
    print(f"File uploaded successfully: {file_info['webViewLink']}")
    return file_info


# Function to list files in a specific Google Drive folder
def list_files_in_folder(service, folder_id):
    """Lists files in a specified folder on Google Drive."""
    query = f"'{folder_id}' in parents and trashed=false"
    results = service.files().list(q=query, fields="files(id, name, mimeType, webViewLink)").execute()
    files = results.get('files', [])
    
    return files