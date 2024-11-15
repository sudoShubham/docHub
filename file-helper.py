from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io
from rest_framework.response import Response



def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        '/Users/shubham/Desktop/Projects/docHub/lively-tensor-441706-h2-d8c7c64a6f3c.json', scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)


def delete_all_files_in_folder(service, folder_id):
    """Delete all files within a specified Google Drive folder."""
    try:
        # List all files in the folder
        query = f"'{folder_id}' in parents"
        results = service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        
        if not files:
            print("No files found in the folder.")
            return

        # Iterate through each file and delete it
        for file in files:
            file_id = file['id']
            file_name = file['name']
            try:
                service.files().delete(fileId=file_id).execute()
                print(f"Deleted file: {file_name} (ID: {file_id})")
            except Exception as e:
                print(f"Error deleting file {file_name} (ID: {file_id}): {str(e)}")

        print("All files deleted from the folder.")
    except Exception as e:
        print(f"Error accessing files in folder {folder_id}: {str(e)}")


def grant_full_access_to_user(service, folder_id, email):
    """Grant read, write, and delete access to a specific email for a Google Drive folder."""
    try:
        # Define permission settings
        permission = {
            'type': 'user',
            'role': 'writer',  # Grants read, write, and delete permissions
            'emailAddress': email
        }

        # Create the permission
        service.permissions().create(
            fileId=folder_id,
            body=permission,
            fields="id"
        ).execute()

        print(f"Full access granted to {email} for folder ID: {folder_id}")

    except Exception as e:
        print(f"Error granting access to {email}: {str(e)}")



service = get_drive_service()
# Assuming you have an authenticated service object
folder_id = "1FfiXiFcl1RFW_7p_45KBHP8d0LfRWWL6"
email = "dochub.fileserver@gmail.com"
grant_full_access_to_user(service, folder_id, email)



# delete_all_files_in_folder(service, folder_id)